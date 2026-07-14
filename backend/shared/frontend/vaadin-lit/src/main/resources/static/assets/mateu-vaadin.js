const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{f as Mi,m as Bi,o as ji,b as Wi,e as Be,i as Vi,s as Hi,j as Gi,k as Ki,t as Ji,u as Yi,l as Xi,_ as ae,n as qe,p as Qi,q as ca,v as di,N as Wt,w as xa,x as ci,y as Ta,z as Zi,A as hi,B as es}from"./vendor-vaadin.js";import{a as C,j as u,k as ke,i as _,x as o,m as E,r as b,A as d,p as ge,l as O,D as ui,b as N,q as ts}from"./vendor-lit.js";import{S as as,a as is,n as ce,b as ss}from"./vendor.js";import"./vendor-ui5.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function a(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=a(s);fetch(s.href,r)}})();const pi=document.createElement("style");pi.innerHTML=`
${Mi.cssText}
${Bi.cssText}
${ji.cssText}
${Wi.cssText}
${Be.cssText}
${Vi.cssText}
${Hi.cssText}
${Gi.cssText}
${Ki.cssText}
${Ji.cssText}
${Yi.cssText}
${Xi.cssText}
`;document.body.appendChild(pi);const dt=new as,W={value:{}},Nt={value:{}},rs={lon:0,lat:0},Wa=3,os=e=>{if(!e)return;const t=e.split(",").map(s=>s.trim());if(t.length!==2)return;const a=Number(t[0]),i=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(i)))return{lon:i,lat:a}},ns=e=>{if(e==null||e.trim()==="")return Wa;const t=Number(e);return Number.isFinite(t)?t:Wa};var ls=Object.defineProperty,ds=Object.getOwnPropertyDescriptor,ha=(e,t,a,i)=>{for(var s=i>1?void 0:i?ds(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ls(t,a,s),s};let kt=class extends _{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:i},{default:s},{fromLonLat:r},{default:n}]=await Promise.all([ae(()=>import("./vendor-ol.js").then(c=>c.M),[]),ae(()=>import("./vendor-ol.js").then(c=>c.V),[]),ae(()=>import("./vendor-ol.js").then(c=>c.T),[]),ae(()=>import("./vendor-ol.js").then(c=>c.O),[]),ae(()=>import("./vendor-ol.js").then(c=>c.p),[]),ae(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=os(this.position)??rs;this.map=new t({target:this.mapElement,layers:[new i({source:new s})],view:new a({center:r([l.lon,l.lat]),zoom:ns(this.zoom)})})}render(){return o`<div id="map"></div>`}};kt.styles=C`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;ha([u()],kt.prototype,"position",2);ha([u()],kt.prototype,"zoom",2);ha([ke("#map")],kt.prototype,"mapElement",2);kt=ha([E("mateu-map")],kt);const cs=typeof HTMLElement<"u"?HTMLElement:class{};class hs extends cs{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,i){this.content=i??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:i},{default:s}]=await Promise.all([ae(()=>import("./vendor.js").then(r=>r.f),[]),ae(()=>import("./vendor.js").then(r=>r.c),[])]);a===this.#t&&(this.innerHTML=s.sanitize(await i.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",hs);var us=Object.defineProperty,ps=Object.getOwnPropertyDescriptor,Vt=(e,t,a,i)=>{for(var s=i>1?void 0:i?ps(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&us(t,a,s),s};let ct=class extends _{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[i,s]=this.pointerPosition(e);a.beginPath(),a.moveTo(i,s),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[i,s]=this.pointerPosition(e);a.lineTo(i,s),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return o`
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
                    <button class="button" @click="${()=>{this.signing=!1}}">Cancel</button>`:d}
            </div>`}render(){const e=this.value!=null&&this.value!=="";return this.signing||!e?this.renderPad():o`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${()=>{this.signing=!0,this.hasStrokes=!1,this.updateComplete.then(()=>this.clear())}}">Sign again</button>
                <button class="button button--danger" @click="${()=>this.emit("")}">Delete</button>
            </div>`}};ct.styles=C`
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
    `;Vt([u()],ct.prototype,"fieldId",2);Vt([u()],ct.prototype,"value",2);Vt([b()],ct.prototype,"signing",2);Vt([b()],ct.prototype,"hasStrokes",2);ct=Vt([E("mateu-signature-pad")],ct);var ms=Object.defineProperty,vs=Object.getOwnPropertyDescriptor,ft=(e,t,a,i)=>{for(var s=i>1?void 0:i?vs(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ms(t,a,s),s};let Ue=class extends _{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expanded=new Set}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}open(){this.opened||(this.opened=!0,this.expanded=new Set(this.pathTo(this.value??"",this.options)??[]),this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}pathTo(e,t){for(const a of t){if(String(a.value)===e)return[];const i=this.pathTo(e,a.children??[]);if(i!=null)return[String(a.value),...i]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const i=this.labelOf(e,a.children??[]);if(i!=null)return i}return null}toggle(e){const t=String(e.value),a=new Set(this.expanded);a.has(t)?a.delete(t):a.add(t),this.expanded=a}renderNode(e,t){const a=(e.children?.length??0)>0,i=this.expanded.has(String(e.value)),s=!this.leavesOnly||!a,r=String(e.value)===String(this.value??"");return o`
            <div class="node ${r?"node--selected":""} ${s?"":"node--group"}"
                 style="padding-left: ${.5+t*1.1}rem;"
                 @mousedown="${n=>n.preventDefault()}"
                 @click="${()=>s?this.pick(e):this.toggle(e)}">
                ${a?o`
                    <span class="caret" @click="${n=>{n.stopPropagation(),this.toggle(e)}}"
                    >${i?"▾":"▸"}</span>`:o`<span class="caret caret--empty"></span>`}
                ${e.label}
            </div>
            ${a&&i?e.children.map(n=>this.renderNode(n,t+1)):d}`}render(){const e=this.value?this.labelOf(String(this.value),this.options)??String(this.value):"";return o`
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
                                 @click="${this.clear}">— (clear)</div>`:d}
                        ${this.options.map(t=>this.renderNode(t,0))}
                    </div>`:d}
            </div>`}};Ue.styles=C`
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
    `;ft([u()],Ue.prototype,"fieldId",2);ft([u()],Ue.prototype,"value",2);ft([u()],Ue.prototype,"options",2);ft([u({type:Boolean})],Ue.prototype,"leavesOnly",2);ft([b()],Ue.prototype,"opened",2);ft([b()],Ue.prototype,"expanded",2);Ue=ft([E("mateu-tree-select")],Ue);var fs=Object.defineProperty,bs=Object.getOwnPropertyDescriptor,Ht=(e,t,a,i)=>{for(var s=i>1?void 0:i?bs(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&fs(t,a,s),s};let ht=class extends _{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const i=new FileReader;i.onload=()=>this.emit(i.result),i.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return o`
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
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:d}
                    ${e?o`
                        <button class="button button--danger" @click="${()=>this.emit("")}">Delete</button>`:d}
                </div>
                ${this.cameraError?o`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:d}
            `}`}};ht.styles=C`
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
    `;Ht([u()],ht.prototype,"fieldId",2);Ht([u()],ht.prototype,"value",2);Ht([b()],ht.prototype,"cameraOpen",2);Ht([b()],ht.prototype,"cameraError",2);ht=Ht([E("mateu-camera-capture")],ht);const St=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),It=(e,t,a)=>({state:e??{},data:t??{},...a});function $e(e,t,a,i){if(!e?.includes("${"))return e;try{return St(e,It(t,a,i))}catch(s){return console.warn(`Mateu: could not interpolate "${e}":`,s),e}}const ot=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return St(e,It(t,a))}catch(i){return i.message}return e},Pa=(e,t,a,i,s)=>{if(!e)return e;const r=It(t,a,{appState:i??{},appData:s??{}});let n=e;try{if(n=St(e,r),n.includes("${"))try{n=St(n,r)}catch(l){n="when evaluating nested "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+i+" and app data is "+s,console.error(l,n,t,a,i,s)}}catch(l){n="when evaluating "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+i+" and app data is "+s,console.error(l,n,t,a,i,s)}return n},mi=(e,t,a,i,s,r)=>{const n=It(t,a,{appState:i??{},appData:s??{},...r}),l=St(e,n);return new Function(...Object.keys(n),`return (${l})`)(...Object.values(n))},vi=(e,t,a,i)=>{const s=It(t,a,i);return new Function(...Object.keys(s),`return (${e})`)(...Object.values(s))},gs=(e,t,a,i)=>St(e,It(t,a,i)),fi=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},$s=(e,t)=>{if(!fi(e,t))return!1;const a=e.toLowerCase().split("+"),i=a[a.length-1];return!!(t.key.toLowerCase()===i||/^[a-z]$/.test(i)&&t.code==="Key"+i.toUpperCase()||/^[0-9]$/.test(i)&&(t.code==="Digit"+i||t.code==="Numpad"+i))},ys=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0;var ie=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(ie||{}),v=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e))(v||{});const Oa="mateu-app-context",bi="mateu-app-context-labels",gi=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},Va=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Ra=()=>gi(Oa),$i=()=>gi(bi),xs=(e,t,a)=>{const i=Ra(),s=$i();t==null||t===""?(delete i[e],delete s[e]):(i[e]=t,a!==void 0&&(s[e]=a)),Va(Oa,i),Va(bi,s)};let Ha=!1;const ws=()=>{Ha||(Ha=!0,window.addEventListener("storage",e=>{e.key===Oa&&e.newValue!==e.oldValue&&window.location.reload()}))};let wt=[];class ks{constructor(){this.axiosInstance=is.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t))}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=ce(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,i,s){return i||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const a=new AbortController;return wt=[...wt,a],this.axiosInstance.get(t,{signal:a.signal})}async post(t,a){const i=new AbortController;return wt=[...wt,i],this.axiosInstance.post(t,a,{signal:i.signal})}async abortAll(){wt.forEach(t=>t.abort()),wt=[]}async runAction(t,a,i,s,r,n,l,c,h,p,f){return a&&a.startsWith("/")&&(a=a.substring(1)),n={...Ra(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),{serverSideType:l,appState:n,componentState:c,parameters:h,initiatorComponentId:r,consumedRoute:i,route:a&&a!=""?"/"+a:"",actionId:s}).then(m=>m.data),p,f,s)}}const za=new ks;var qt=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(qt||{}),Ne=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(Ne||{}),Ss=Object.defineProperty,yi=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,a,s)||s);return s&&Ss(t,a,s),s};class ua extends _{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,i=document.createElement(a.name);for(let s in a.attributes)i.setAttribute(s,a.attributes[s]);for(let s in a.on)i.addEventListener(s,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[s],parameters:{event:r}},bubbles:!0,composed:!0}))});return i},this.closeModal=()=>{const t=this.shadowRoot?.querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=dt.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==ie.ClientSide){const a=t.component,i=a.metadata;if(i?.type==v.App){const s=i,r=this.getRemoteMenus(s.menu);if(r.length>0){const n=r.map(l=>za.runAction(l.baseUrl,l.route,"_empty","",l.baseUrl+"#"+l.route,void 0,void 0,void 0,l.params,this,!0));Promise.all(n).then(l=>{s.menu=this.updateMenu(s.menu,l.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),s.variant=Ne.MENU_ON_TOP,dt.next({fragment:{component:a,data:void 0,state:void 0,action:qt.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,a){const i=[];return t.forEach(s=>{if(s.remote){const r=a.find(n=>n.targetComponentId==s.baseUrl+"#"+s.route);if(r&&r.component?.type==ie.ClientSide){const n=r.component;if(n.metadata?.type==v.App){const l=n.metadata,c=s.serverSideType&&s.serverSideType!=""?s.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,s.baseUrl,c,s.route,l.route),i.push(...l.menu)}}}else i.push(s)}),i}changeBaseUrl(t,a,i,s,r){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,a,i,s,r):(n.consumedRoute=r??"",n.baseUrl=a,n.serverSideType=i,n.uriPrefix=s))})}getRemoteMenus(t){const a=[];return t.forEach(i=>{i.remote&&a.push(i)}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const i={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>dt.next(i))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const i=atob(a.base64Content),s=new Uint8Array(i.length);for(let c=0;c<i.length;c++)s[c]=i.charCodeAt(c);const r=new Blob([s],{type:a.mimeType}),n=URL.createObjectURL(r),l=document.createElement("a");l.href=n,l.download=a.filename??"export",l.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,i=a?.emitsName??a?.serverSideType;let s=t.payload??t.detail;i&&s&&typeof s=="object"&&(s={...s,__source:i}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:s,bubbles:!0,composed:!0}))}}}yi([u()],ua.prototype,"id");yi([u()],ua.prototype,"baseUrl");var Cs=Object.defineProperty,Es=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,a,s)||s);return s&&Cs(t,a,s),s};class pa extends ua{applyFragment(t){}manageActionRequestedEvent(t){}}Es([u()],pa.prototype,"component");var At=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(At||{});const _s=(e,t,a)=>{const i=e[a.path];return i?o`<span theme="badge pill ${ma(i.type)}">${i.message}</span>`:o``},ma=e=>{switch(e){case At.SUCCESS:return"success";case At.WARNING:return"warning";case At.DANGER:return"error";case At.NONE:return"contrast"}return""},Is=(e,t,a)=>{const s=e[a.path]?"vaadin:check":"vaadin:minus";return o`<vaadin-icon 
                    icon="${s}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},Ts=(e,t,a,i,s)=>{const r=e[a.path];let n=r;return i=="money"&&r&&r.locale&&r.currency?n=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):s=="money"&&(n=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),o`${n}`},Ga=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Ps=(e,t,a,i,s,r)=>{const n=a.xcolumn??r;if(n.text){if(n.actionId)return o`<a href="javascript: void(0);" @click="${h=>Ga(a,n,e)}">${n.text}</a>`;const c=e[a.path];return o`<a href="${c}">${n.text}</a>`}if(i=="string"){if(n.actionId){const h=e[a.path];return o`<a href="javascript: void(0);" @click="${p=>Ga(a,n,e)}">${h}</a>`}const c=e[a.path];return o`<a href="${c}">${c}</a>`}const l=e[a.path];return o`<a href="${l.href}">${l.text}</a>`},Os=(e,t,a,i,s)=>i=="string"?e[a.path].split(",").map(l=>o`<vaadin-icon icon="${l}" style="width: 16px;"></vaadin-icon>`):e[a.path].split(",").map(n=>o`<vaadin-icon icon="${n.icon}" style="width: 16px;"></vaadin-icon>`),Rs=(e,t,a,i,s)=>{const r=e[a.path];return o`${ge(r)}`},zs=(e,t,a,i,s,r)=>{if(i=="string"){const l=e[a.path],c="max-height: 40px; "+(r.style??"");return o`<img src="${l}" style="${c}">`}const n=e[a.path];return o`<img src="${n.src}" style="${r.style??""}">`},Ds=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Ka=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Ls=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},Ja=(e,t,a)=>{const i=e[a.path]?.actions?.map(s=>s.icon?{component:Ls(s),methodNameInCrud:s.methodNameInCrud}:{...s,text:s.label});return!i||i.length==0?o``:o`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:i}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${Ds}"
                                     ></vaadin-menu-bar>
                                   `},As=(e,t,a)=>{if(a.path=="select"){const r={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return o`
         <vaadin-button theme="tertiary" title="Select" @click="${Ka}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const i=a.path&&e[a.path].methodNameInCrud?e[a.path]:e.action,s=i.icon&&!i.label;return o`
         <vaadin-button theme="tertiary${s?" icon":""}" title="${i.label||d}" @click="${Ka}" .row="${e}" .action="${i}">
             ${i.icon?o`<vaadin-icon icon="${i.icon}"></vaadin-icon>`:d}
             ${i.label?i.label:d}
         </vaadin-button>
    `},Fs=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Ns=(e,t,a,i,s,r)=>{const n=a.xcolumn??r;if(n.actionId){const c=n.text||e[a.path];return o`
            <vaadin-button theme="tertiary" @click="${h=>Fs(a,n,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[a.path];return o`<a href="${l}">${n.text||l}</a>`};class qs{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const M=new qs,nt=(e,t,a,i,s,r,n,l,c)=>(t.slot=l,x(e,t,a,i,s,r,n,c)),x=(e,t,a,i,s,r,n,l)=>{if(!t)return o``;if(t.type==ie.ClientSide)return M.get().renderClientSideComponent(e,t,a,i,s,r,n,l);const c=e.route,h=e.consumedRoute;return o`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${h}"
                         baseUrl="${a}"
                         slot="${t.slot??d}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...i}}"
                         .data="${{...s}}"
                         .appState="${r}"
                         .appData="${n}"
        >
       </mateu-component>`},Us=(e,t,a,i,s,r,n,l,c)=>{const h=e[a.path];return x(i,h,s,r,n,l,c)},Ea=new WeakMap,Ms=(e,t)=>Ea.get(e)?.[t],Bs=(e,t,a)=>{let i=Ea.get(e);i||(i={},Ea.set(e,i)),i[t]=a},Ya=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},js=(e,t,a,i)=>{const s=a?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!s){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const h=i[s];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:s,value:Array.isArray(h)?[...h]:h},bubbles:!0,composed:!0}))},n=e[t.id],l=n==null?"":String(n);switch(t.editorType){case"boolean":return o`<vaadin-checkbox ?checked=${!!n} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return o`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Ya(c.target.value))}></vaadin-integer-field>`;case"number":return o`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(Ya(c.target.value))}></vaadin-number-field>`;case"date":return o`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return o`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return o`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,h=`search-${c}-${t.id}`,p=`${c}-${t.id}`,m=(t.editorOptions??[]).find(y=>String(y.value)===l)??(l?{value:l,label:Ms(e,t.id)??l}:void 0);return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(y,g)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:h,parameters:{searchText:y.filter,size:y.pageSize,page:y.page},callback:I=>{const B=I?.fragments?.[0]?.data?.[p];g(B?.content??[],B?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${m}
                @selected-item-changed=${y=>{const g=y.detail.value,I=g?g.value:null;String(I??"")!==l&&(g&&Bs(e,t.id,g.label),r(I))}}></vaadin-combo-box>`}default:return o`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},wa=e=>Qi(()=>o`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),Ws=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},Vs=(e,t,a,i,s,r,n)=>{const l=$e(e.label,i,s);return o`
<vaadin-grid-column-group header="${l}">
    ${e.columns.map(c=>xi(c.metadata,t,a,i,s,r,n))}
</vaadin-grid-column-group>
`},Da=(e,t,a,i,s,r,n)=>v.GridGroupColumn==e.metadata?.type?Vs(e.metadata,t,a,i,s,r,n):xi(e.metadata,t,a,i,s,r,n),xi=(e,t,a,i,s,r,n)=>{const l=$e(e.label,i,s);return e.sortable?o`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${Ws}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${wa(l)}
                                ${qe((c,h,p)=>Qt(c,h,p,e,t,a,i,s,r,n),[])}
                        ></vaadin-grid-sort-column>
                    `:e.filterable?o`
                        <vaadin-grid-filter-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${wa(l)}
                                ${qe((c,h,p)=>Qt(c,h,p,e,t,a,i,s,r,n),[])}
                        ></vaadin-grid-filter-column>
                    `:o`
                        <vaadin-grid-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                .xcolumn="${e}"
                                ${wa(l)}
                                ${qe((c,h,p)=>Qt(c,h,p,e,t,a,i,s,r,n),[])}
                        ></vaadin-grid-column>
                    `},Qt=(e,t,a,i,s,r,n,l,c,h)=>{const p=a.dataset.dataType??"",f=a.dataset.stereotype??"";if(i.editable)return js(e,i,s,n);if(p=="status")return _s(e,t,a);if(p=="bool")return Is(e,t,a);if(p=="money"||f=="money")return Ts(e,t,a,p,f);if(p=="link"||f=="link")return Ps(e,t,a,p,f,i);if(p=="icon"||f=="icon")return Os(e,t,a,p);if(f=="html")return Rs(e,t,a);if(f=="image")return zs(e,t,a,p,f,i);if(p=="menu")return Ja(e,t,a);if(p=="component")return Us(e,t,a,s,r,n,l,c,h);if(p=="action")return As(e,t,a);if(p=="actionGroup")return Ja(e,t,a);if(f=="button"||i.actionId)return Ns(e,t,a,p,f,i);const m=e[a.path];return o`<span title="${m}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${m}</span>`};var Hs=Object.defineProperty,Gs=Object.getOwnPropertyDescriptor,tt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Gs(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Hs(t,a,s),s};const Ks=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Js=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let Pe=class extends pa{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!fi(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const i=this.currentItems(),s=parseInt(a[1],10)-1;s>=i.length||(e.preventDefault(),this.selectRow(i[s]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=Ks();if(e&&e!==document.body&&!Js(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:i}=e.detail;if(this.rangeStartItem??=t,i){let s=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(s=this.state[this.field.fieldId]);const[r,n]=[this.rangeStartItem,t].map(h=>s.indexOf(h)).sort((h,p)=>h-p),l=s.slice(r,n+1),c=new Set(this.selectedItems);l.forEach(h=>{a?c.add(h):c.delete(h)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,i="";this.data[this.id]&&(this.data[this.id].searchSignature||i)&&this.data[this.id].searchSignature!=i&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:i,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,i)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=i)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return o`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${ca(()=>o`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>ce()])}
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
                    .cellPartNameGenerator="${O(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${O(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${O(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${a=>{this.selectedItems=a.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${O(this.field?.onItemSelectionActionId?a=>{const s=a.currentTarget.getEventContext(a)?.item;s&&this.selectRow(s)}:void 0)}"
                    @active-item-changed="${O(this.field?.detailPath&&!this.field?.useButtonForDetail?a=>{if(this.field?.detailPath){const i=a.detail.value;i?this.detailsOpenedItems=[i]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${O(this.field?.detailPath?di(a=>o`${x(this,a[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:o`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(a=>Da(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?o`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${qe(a=>o`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+"_selected_items"]=[a],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:d}

                ${this.field?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${qe((a,{detailsOpened:i})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${i?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${i?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=this.detailsOpenedItems.length?this.detailsOpenedItems[0]._rowNumber==a._rowNumber?[]:[a]:[a]}}"
              >
                <vaadin-icon
                  .icon="${i?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}

            </vaadin-grid>
            ${this.field?.readOnly?d:this.field?.inlineEditing?o`
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
        </vaadin-vertical-layout>`}};Pe.styles=C`
        ${Be}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;tt([u()],Pe.prototype,"field",2);tt([u()],Pe.prototype,"state",2);tt([u()],Pe.prototype,"data",2);tt([u()],Pe.prototype,"appState",2);tt([u()],Pe.prototype,"appData",2);tt([u()],Pe.prototype,"selectedItems",2);tt([b()],Pe.prototype,"detailsOpenedItems",2);Pe=tt([E("mateu-grid")],Pe);var Ys=Object.defineProperty,Xs=Object.getOwnPropertyDescriptor,Tt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Xs(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ys(t,a,s),s};let Qe=class extends _{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return o`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(a=>o`
                            <div 
                                    class="choice ${this.value==a.value||Array.isArray(this.value)&&this.value.includes(a.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}"
                            >${a.description||a.image?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${a.image?o`
                                            <img src="${a.image}" alt="${a.label}" style="${a.imageStyle??"width: 2rem;"}" />
                                        `:d}
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

       `}};Qe.styles=C`
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
  `;Tt([u()],Qe.prototype,"field",2);Tt([u()],Qe.prototype,"baseUrl",2);Tt([u()],Qe.prototype,"state",2);Tt([u()],Qe.prototype,"data",2);Tt([u()],Qe.prototype,"value",2);Qe=Tt([E("mateu-choice")],Qe);var Qs=Object.defineProperty,Zs=Object.getOwnPropertyDescriptor,Re=(e,t,a,i)=>{for(var s=i>1?void 0:i?Zs(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Qs(t,a,s),s};let he=class extends _{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return o`
            <vaadin-number-field
                    id="${this.fieldId}"
                    label="${this.label}"
                    @value-changed="${this.valueChanged}"
                    .value="${this.value?.value}"
                    .helperText="${this.helperText}"
                    ?autofocus="${this.autofocus}"
                    ?required="${this.required||d}"
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
       `}};he.styles=C`
  `;Re([u()],he.prototype,"fieldId",2);Re([u()],he.prototype,"label",2);Re([u()],he.prototype,"state",2);Re([u()],he.prototype,"data",2);Re([u()],he.prototype,"value",2);Re([u()],he.prototype,"autoFocus",2);Re([u()],he.prototype,"required",2);Re([u()],he.prototype,"colspan",2);Re([u()],he.prototype,"helperText",2);he=Re([E("mateu-money-field")],he);const Xa=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"],er=(e,t,a)=>{const i=e.metadata;return o`<vaadin-avatar
            img="${i.image}"
            name="${Ye(i.name,t,a)}"
            abbr="${i.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},Ye=(e,t,a)=>typeof e=="string"&&e.includes("${")?$e(e,t,a):e,tr=e=>{const t=e.metadata;return o`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`};var ar=Object.defineProperty,ir=Object.getOwnPropertyDescriptor,ne=(e,t,a,i)=>{for(var s=i>1?void 0:i?ir(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ar(t,a,s),s};let H=class extends _{constructor(){super(...arguments),this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return o`
            <ui5-color-picker value="${t}" @change="${a=>this.colorPickerValue=a.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>o`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let i;e.detail.value&&(i=e.detail.value.map(s=>s.value),i&&i.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(s=>{this.data[this.id].content?.find(r=>s.value==r.value)||this.data[this.id].content.push(s)}))),this.compareArrays(i,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(a=>a.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(a=>a.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(a=>e.indexOf(a.value)>=0).map(a=>this.data[this.id].content.indexOf(a))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((a,i)=>a===t[i]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let i;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(i=e.detail.value.map(s=>this.data[this.id].content[s].value)):i=e.detail.value.map(s=>this.field.options[s].value)),this.compareArrays(i,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const a=this.data[this.id].content[e.detail.value];a&&(t=a.value)}}else{const a=this.field.options[e.detail.value];a&&(t=a.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.helperShownInControl=!1,this.fileUploaded=e=>{const t=this.field?.fieldId??"",a=this.state[t];a.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",a=(e.detail.value??[]).filter(s=>s.id).map(s=>s.id),i=(this.state[t]??[]).map(s=>s.id);if(!this.compareArrays(i,a)){const s=(e.detail.value??[]).filter(r=>r.id).map(r=>({id:r.id,name:r.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const i=new FileReader;i.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},i.readAsDataURL(a),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>o`
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
                                    `:d}
                ${e.image?o`
                    <div>
                    <img
                            style="width: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
                            src="${e.image}"
                            alt="${e.label}"
                    />
                    </div>
                                        `:d}
                <div>
                    ${e.label}
                    ${e.description?o`
            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
                ${e.description}
            </div>
        `:d}
                </div>

            </vaadin-horizontal-layout>
                            `:e.label}
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=Xa.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}remoteComboDataProvider(e){return(t,a)=>{const{filter:i,page:s,pageSize:r}=t,n=i??"";this._comboFilter=n,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:i,fieldId:this.field?.fieldId,size:r,page:s,sort:void 0},callback:l=>{if(n===this._comboFilter)if(l?.messages?.forEach(c=>{Wt.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],a([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return d;const t=$e(e.href,this.state,this.data)??e.href,a=$e(e.title,this.state,this.data)||t,i=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),s=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return o`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${O(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${s};"
        ><vaadin-icon icon="${i}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const s=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(s.height===0)return;const r=Math.max(0,s.top+s.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),n=`${Math.round(r)}px`;this.navLinkOffset!==n&&(this.navLinkOffset=n)})}helperText(){return this.helperShownInControl=!0,Ye(this.field?.description??"",this.state,this.data)??""}render(){const e=this.field?.fieldId??"";this.rendered=!0;const t=this.renderNavLink();this.helperShownInControl=!1;const a=this.renderField(),i=this.field?.description&&!this.helperShownInControl?Ye(this.field.description,this.state,this.data):void 0;return o`<div style="display: block;">
            <div style="${t!==d?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${a}</div>${t}</div>
            ${i?o`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${i}</div>
            `:d}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?o`
                <div><ul>${this.data.errors[e].map(s=>o`<li>${s}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=Xa}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",i=$e(a,this.state,this.data),s=this.labelAlreadyRendered||!i||i=="null"?d:i;return this.field?.stereotype=="badge"?this.renderBadgeField(e,t,s,i):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,s,i):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,s,i):this.field?.dataType=="file"?this.renderFileField(e,t,s,i):this.field?.dataType=="string"?this.renderStringField(e,t,s,i):this.field?.dataType=="number"?this.renderNumberField(e,t,s,i):this.field?.dataType=="integer"?this.renderIntegerField(e,t,s,i):this.field?.dataType=="bool"?this.renderBoolField(e,t,s,i):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,s,i):this.field?.dataType=="date"?this.renderDateField(e,t,s,i):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,s,i):this.field?.dataType=="time"?this.renderTimeField(e,t,s,i):this.field?.dataType=="array"?this.renderArrayField(e,t,s,i):this.field?.dataType=="money"?this.renderMoneyField(e,t,s,i):this.field?.dataType=="status"?this.renderStatusField(e,t,s,i):this.field?.dataType=="range"?this.renderRangeField(e,t,s,i):o`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,i){if(!this.field)return o``;const s=t===!0||t==="true";return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${s?"success":""} pill" style="${s?"":"opacity: 0.4;"}">${i}</span>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,i){if(!this.field)return o``;let s=Ye(t,this.state,this.data);const r=s&&typeof s=="object"&&"value"in s?s:null;s&&s.value&&(s=s.value);const n=this.field?.dataType=="bool"||s===!0||s===!1,l=this.field?.dataType=="money",c=s!=null&&s!=="";let h=c?String(s):"—";if(l&&c){const f=typeof s=="number"?s:parseFloat(String(s));isNaN(f)||(h=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(f):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(f))}const p=n?o`<vaadin-icon icon="${s===!0||s==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${h}</span>`:o`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${h}</span>`;return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${p}</vaadin-custom-field>`}renderReadOnlyField(e,t,a,i){if(!this.field)return o``;let s=Ye(t,this.state,this.data)||this.data[e];if(s&&s.value&&(s=s.value),this.field.stereotype=="image"||this.field.stereotype=="uploadableImage"||this.field.stereotype=="signature"||this.field.stereotype=="camera")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${s}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${s?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const r=s!=null?String(s):"";return o`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        value="${s}"
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
                ></vaadin-icon>`:d}</vaadin-text-field>
`}renderFileField(e,t,a,i){if(!this.field)return o``;const s=t?.map(r=>({id:r.id,name:r.name,type:"",uploadTarget:"",complete:!0}))??[];return o`
                <vaadin-custom-field
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    <vaadin-upload
                            target="/upload"
                            .files="${s}"
                            @upload-success="${this.fileUploaded}"
                            @files-changed="${this.fileChanged}"
                    ></vaadin-upload>
                </vaadin-custom-field>
            `}renderStringField(e,t,a,i){if(!this.field)return o``;if(this.field?.stereotype=="searchable"){const s=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:n.currentTarget.value}},bubbles:!0,composed:!0}))},r=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${s}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+"-label"]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${r}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="select"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,n="";this.data[this.id]&&(this.data[this.id].searchSignature||n)&&this.data[this.id].searchSignature!=n&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.action,parameters:{searchText:n,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let l=t;return t&&t.value&&(l=t.value),o`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.data[this.id]?.content}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${l}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}let s=t;return t&&t.value&&(s=t.value),o`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${s}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `}if(this.field?.stereotype=="markdown")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${t}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates;let r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(l=>l.value==t)),!r&&this.comboData&&(r=this.comboData.find(l=>l.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+"-label"]??t});const n=this.remoteComboDataProvider(s.action);return o`
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
                            ?required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${l=>{if(l.key=="Backspace"){const c=l.currentTarget;c.inputElement.value||(c.value="")}}}"
                            ${xa(this.comboRenderer,[])}
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
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${xa(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${O(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(n=>o`
                            <vaadin-item>${n.description||n.image||n.icon?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${n.icon?o`
                                        <vaadin-icon icon="${n.icon}"></vaadin-icon>
                                    `:d}
                                    ${n.image?o`
                                            <img src="${n.image}" alt="${n.label}" style="width: 2rem;" />
                                        `:d}
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
                            selected="${O(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(s=>o`
                            <vaadin-item>${s.description||s.image||s.icon?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${s.icon?o`
                                        <vaadin-icon icon="${s.icon}"></vaadin-icon>
                                    `:d}
                                    ${s.image?o`
                                            <img src="${s.image}" alt="${s.label}" style="width: 2rem;" />
                                        `:d}
                                    <vaadin-vertical-layout>
                                        <span> ${s.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${s.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:s.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map(n=>o`
                            <vaadin-radio-button value="${n.value}" label="${n.label}" ?checked="${n&&t&&n.value===t}">
                                ${n.description||n.image||n.icon?o`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${n.icon?o`
                                                <vaadin-icon icon="${n.icon}"></vaadin-icon>
                                            `:d}
                                            ${n.image?o`
                                                <img src="${n.image}" alt="${n.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${n.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${n.description?o`
                                            <div>${n.description}</div>
                                        `:d}
                                    </label>
                                `:d}
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
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(s=>o`
                            <vaadin-radio-button value="${s.value}" label="${s.label}">
                                ${s.description||s.image||s.icon?o`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${s.icon?o`
                                                <vaadin-icon icon="${s.icon}"></vaadin-icon>
                                            `:d}
                                            ${s.image?o`
                                                <img src="${s.image}" alt="${s.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${s.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${s.description?o`
                                            <div>${s.description}</div>
                                        `:d}
                                    </label>
                                `:d}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}if(this.field.stereotype=="popover")return o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
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
                            ${ci(()=>o`
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
                            required="${this.field.required||d}"
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
                            required="${this.field.required||d}"
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
                            required="${this.field.required||d}"
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
                                    required="${this.field.required||d}"
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
                                    required="${this.field.required||d}"
                                    @value-changed="${this.valueChanged}"
                                    value="${t}"
                                    .helperText="${this.helperText()}"
                                    ?autofocus="${this.field.wantsFocus}"
                                    data-colspan="${this.field.colspan}"
                            item-label-path="displayName"
                            style="--vaadin-combo-box-overlay-width: 16em"
                                    .filteredItems="${this.filteredIcons}"
                            @filter-changed="${this.iconFilterChanged}"
                            ${xa(this.iconComboboxRenderer,[])}
                    >
                        ${t?o`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:d}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype=="password")return o`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
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
                `;if(this.field?.stereotype=="uploadableImage"){const s=t!=null&&t!=="";return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${s?o`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??""}"
                                    class="${this.component?.cssClasses}">`:o`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${s?"Replace":"Upload"}
                                </vaadin-button>
                                ${s?o`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
                                    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                                    Delete
                                </vaadin-button>`:d}
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
                        <input type="color" @input="${s=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"/>
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
  ${ca(this.renderColorPicker,[])}
  ${Ta(this.renderColorPickerFooter,[])}
></vaadin-dialog>
                `:o`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`}renderNumberField(e,t,a,i){return this.field?o`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||d}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:d}"
                        max="${this.field.max!=null?this.field.max:d}"
            ></vaadin-number-field>`:o``}renderIntegerField(e,t,a,i){if(!this.field)return o``;if(this.field.stereotype=="stars"){let s=t;isNaN(s)&&(s=0);const r=[1,2,3,4,5];return o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${r.map(n=>o`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${n<=s?"--lumo-warning-color":"--lumo-shade-30pct"});"
                            @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:n,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype=="slider"){let s=t;return isNaN(s)&&(s=0),o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${r=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${s??0}"/></vaadin-custom-field>
                `}return o`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||d}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:d}"
                        max="${this.field.max!=null?this.field.max:d}"
                ></vaadin-integer-field>
            `}renderBoolField(e,t,a,i){return this.field?o`
                <vaadin-custom-field
                        label="${a}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                >
                    ${this.field.stereotype=="toggle"?o`
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${t}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    `:o`
                        <vaadin-checkbox
                                id="${this.field.fieldId}"
                                @change="${this.checked}"
                                value="${t}"
                                ?checked=${t}
                                ?autofocus="${this.field.wantsFocus}"
                        ></vaadin-checkbox>
                    `}
                </vaadin-custom-field>
            `:o``}renderDateRangeField(e,t,a,i){if(!this.field)return o``;const s=t?t.from+";"+t.to:void 0;return o`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${r=>{r.detail.value&&(r.detail.value={from:r.detail.value.split(";")[0],to:r.detail.value.split(";")[1]}),this.valueChanged(r)}}"
                    value="${s}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,i){return this.field?o`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:o``}renderDateTimeField(e,t,a,i){return this.field?o`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:o``}renderTimeField(e,t,a,i){return this.field?o`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:o``}renderArrayField(e,t,a,i){if(!this.field)return o``;if(this.field?.stereotype=="choice")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||d}"
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${O(this.selectedIndexes(t))}"
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
                                     .selectedValues="${O(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(s=>o`
                            <vaadin-item>${s.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r=this.remoteComboDataProvider(s.action);return o`
                        <vaadin-multi-select-combo-box
                            label="${a}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${r}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||d}"
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
                            ?required="${this.field.required||d}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),o`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${a}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
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
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?"multi-column":""}"
                        .value="${t}"
                >
                        ${this.field.options?.map(s=>o`
                        <vaadin-checkbox 
                                value="${s.value}" 
                                label="${s.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,a,i){if(!this.field)return o``;if(this.field.readOnly){const s=t;let r=s;return s&&s.locale&&s.currency?r=new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(s.value):r=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(s),o`<vaadin-custom-field
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
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,a,i){if(!this.field)return o``;const s=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${s?o`<span theme="badge pill ${ma(s.type)}">${s.message}</span>`:o``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,i){if(!this.field)return o``;const s=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${s?.from??0}" end-value="${s?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${r=>{const n=r.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:n.startValue,to:n.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};H.styles=C`
        ${Be}

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
  `;ne([u()],H.prototype,"component",2);ne([u()],H.prototype,"field",2);ne([u()],H.prototype,"baseUrl",2);ne([u()],H.prototype,"state",2);ne([u()],H.prototype,"data",2);ne([u()],H.prototype,"appState",2);ne([u()],H.prototype,"appData",2);ne([u()],H.prototype,"labelAlreadyRendered",2);ne([b()],H.prototype,"colorPickerOpened",2);ne([b()],H.prototype,"colorPickerValue",2);ne([b()],H.prototype,"filteredIcons",2);ne([b()],H.prototype,"navLinkOffset",2);H=ne([E("mateu-field")],H);const sr=(e,t,a)=>{const i=e.metadata;return o`<span theme="badge ${i.color} ${i.pill?"pill":""} ${i.small?"small":""} ${i.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${Ye(i.text,t,a)}</span>`},rr=(e,t,a)=>{const i=Ye(e.text,t,a);if(!i)return d;let s=Ye(e.color,t,a);return s=="SUCCESS"&&(s="success"),s=="ERROR"&&(s="error"),s=="DANGER"&&(s="error"),s=="WARNING"&&(s="warning"),s=="INFO"&&(s="info"),s=="PRIMARY"&&(s="primary"),s=="SECONDARY"&&(s="secondary"),s=="TERTIARY"&&(s="tertiary"),s=="QUATERNARY"&&(s="quaternary"),s=="LIGHT"&&(s="light"),s=="DARK"&&(s="dark"),o`<span theme="badge ${s} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${i}</span>`};var or=Object.defineProperty,nr=Object.getOwnPropertyDescriptor,bt=(e,t,a,i)=>{for(var s=i>1?void 0:i?nr(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&or(t,a,s),s};const lr=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Qa=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let Me=class extends _{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>$e(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),a=M.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return a||o`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${lr(e)||d}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?o`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:d}${t}${e.iconOnRight?o`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `}}render(){const e=this.metadata;if(!e)return o``;const t=e.toolbar??[],a=t.filter(l=>Qa(l.actionId)),i=t.filter(l=>!Qa(l.actionId)),s=a.length>0&&i.length>0?o`<span class="toolbar-divider"></span>`:d,r=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||t.length>0,n=e.level??0;return n>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),o`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((l,c)=>o`
                        ${c>0?o`<span>/</span>`:d}
                        ${l.link?o`<button class="breadcrumb-link" @click="${()=>window.location.href=`${l.link}`}">${l.text}</button>`:o`<span>${l.text}</span>`}
                    `)}
                </div>
            `:d}
            ${e.noHeader?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                    ${e?.header?.map(l=>x(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${a.map(this.renderBtn)}
                    ${s}
                    ${i.map(this.renderBtn)}
                </div>
            `:r?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?x(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&n==0?o`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ot(e?.title,this.state??{},this.data??{}))}</h2>`:d}
                        ${e?.title&&n==1?o`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ot(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&n==2?o`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ot(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&n==3?o`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ot(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&n>3?o`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ge(ot(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?o`<span style="display: inline-block; margin-block-end: 0.83em;">${ge(ot(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(l=>o`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(l.title)}</div>
                                <div>${ge(ot(l.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(l=>x(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${a.map(this.renderBtn)}
                        ${s}
                        ${i.map(this.renderBtn)}
                    </div>
                </div>
            `:d}
            ${e.badges&&e.badges.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(l=>rr(l,this.state??{},this.data??{}))}
                </div>
            `:d}
        `}};Me.styles=C`
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

        ${Be}
    `;bt([u()],Me.prototype,"metadata",2);bt([u()],Me.prototype,"baseUrl",2);bt([u()],Me.prototype,"state",2);bt([u()],Me.prototype,"data",2);bt([u()],Me.prototype,"appState",2);bt([u()],Me.prototype,"appData",2);Me=bt([E("mateu-content-header")],Me);var dr=Object.defineProperty,cr=Object.getOwnPropertyDescriptor,Gt=(e,t,a,i)=>{for(var s=i>1?void 0:i?cr(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&dr(t,a,s),s};let ut=class extends pa{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return o`
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
       `}};ut.styles=C`
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
    `;Gt([u()],ut.prototype,"state",2);Gt([u()],ut.prototype,"data",2);Gt([u()],ut.prototype,"appState",2);Gt([u()],ut.prototype,"appData",2);ut=Gt([E("mateu-form")],ut);var hr=Object.defineProperty,ur=Object.getOwnPropertyDescriptor,La=(e,t,a,i)=>{for(var s=i>1?void 0:i?ur(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&hr(t,a,s),s};let Ut=class extends _{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?o`${e.map(()=>o`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?o`${e.map(()=>o`<div class="bone row"></div>`)}`:this.variant=="form"?o`${e.map(()=>o`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:o`${e.map(()=>o`<div class="bone line"></div>`)}`}};Ut.styles=C`
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
    `;La([u()],Ut.prototype,"variant",2);La([u({type:Number})],Ut.prototype,"count",2);Ut=La([E("mateu-skeleton")],Ut);const pr=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},lt=(e,t,a,i,s,r)=>o`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${a?o`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${i??e??"Nothing here yet."}</span>
            ${s&&r?o`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${n=>pr(n,s)}">${r}</vaadin-button>
            `:d}
        </div>
    `,mr=e=>{const t=e.metadata;return o`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${lt(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},vr=e=>{const t=e.metadata;return o`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `};var fr=Object.defineProperty,br=Object.getOwnPropertyDescriptor,Se=(e,t,a,i)=>{for(var s=i>1?void 0:i?br(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&fr(t,a,s),s};let se=class extends _{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let i=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),i=!0,this.grid&&this.grid.recalculateColumnWidths()),i||this.pagesRequested.find(s=>s==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const i=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],i),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const i=t.parameters[a];i!==void 0&&(this.state._selectedId=String(i),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:i}=e,s=this.metadata?.columns?.find(r=>r.metadata.id==a?.path);if(s?.metadata){const r=(s?.metadata).tooltipPath;r&&a&&i&&(t=i[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId;e&&t!==void 0?this.grid.cellPartNameGenerator=(a,i)=>String(i.item[e])===String(t)?"selected-row":"":this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id]?.page;let t="";this.metadata?.wrapCellContent&&(t+=" wrap-cell-content"),this.metadata?.compact&&(t+=" compact"),this.metadata?.noBorder&&(t+=" no-border"),this.metadata?.noRowBorder&&(t+=" no-row-borders"),this.metadata?.columnBorders&&(t+=" column-borders"),this.metadata?.rowStripes&&(t+=" row-stripes");const a=this.state[this.id+"_selected_items"]||[];return o`
            <vaadin-grid
                    .items="${e?.content}"
                    item-id-path="_rowNumber"
                    .selectedItems="${a}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?"lazy":d}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.dataProvider}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${i=>{this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(i.detail.value)||(this.state[this.id+"_selected_items"]=i.detail.value,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${O(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?i=>{if(this.metadata?.detailPath){const s=i.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${O(this.metadata?.detailPath?di(i=>o`${x(this,i[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${t}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.columns?.map(i=>Da(i,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}
                ${this.metadata?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${qe((i,{detailsOpened:s})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${s?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${s?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=s?this.detailsOpenedItems.filter(r=>r!==i):[...this.detailsOpenedItems,i]}}"
              >
                <vaadin-icon
                  .icon="${s?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}
                <span slot="empty-state">${lt(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(i=>i.metadata.tooltipPath)?o`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}};se.styles=C`
        ${Be}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
  `;Se([u()],se.prototype,"id",2);Se([u()],se.prototype,"metadata",2);Se([u()],se.prototype,"baseUrl",2);Se([u()],se.prototype,"state",2);Se([u()],se.prototype,"data",2);Se([u()],se.prototype,"appState",2);Se([u()],se.prototype,"appData",2);Se([u()],se.prototype,"emptyStateMessage",2);Se([b()],se.prototype,"detailsOpenedItems",2);Se([ke("vaadin-grid")],se.prototype,"grid",2);se=Se([E("mateu-table")],se);var gr=Object.defineProperty,$r=Object.getOwnPropertyDescriptor,Ce=(e,t,a,i)=>{for(var s=i>1?void 0:i?$r(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&gr(t,a,s),s};let re=class extends _{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]),t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(i=>i.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return $e(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return o`
            <div class="${a}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",a=s=>{const r=s.closest(".panel-input-row"),n=r.querySelector("input.range-from").value,l=r.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,l===""?void 0:l),this.requestSearch()},i=s=>{s.key==="Enter"&&a(s.target),s.key==="Escape"&&this.closePanel()};return o`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,"from")}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${i}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,"to")}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${i}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${s=>a(s.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),a=i=>{const s=t.includes(i)?t.filter(r=>r!==i):[...t,i];this.emitValueChanged(e.fieldId,s.length>0?s:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return o`${(e.options??[]).map(i=>this.panelRow(o`
            <span class="multi-check ${t.includes(i.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(i.value)?"✓":""}</span>
            ${i.label??i.value}
        `,()=>a(i.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return o`${e.options.map(i=>this.panelRow(i.label??i.value,()=>this.applyFilter(e.fieldId,i.value)))}`;if(this.isBooleanFilter(e))return o`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),a=i=>{i.value!==""&&this.applyFilter(e.fieldId,t?Number(i.value):i.value)};return o`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${i=>i.stopPropagation()}"
                       @keydown="${i=>{i.key==="Enter"&&a(i.target),i.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${i=>a(i.target.previousElementSibling)}">Apply</button>
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
                                    @click="${a=>{a.stopPropagation(),this.removeChip(t.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable!==!1?o`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?"Search":""}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:d}"
                               .value="${this.draftText??""}"
                               @input="${t=>{this.draftText=t.target.value,this.openPanel()}}"
                               @keydown="${t=>{t.key==="Enter"&&this.commitText(t.target),t.key==="Escape"&&this.closePanel()}}"/>
                    `:d}
                </div>
                ${this.renderPanel()}
            </div>
            <slot></slot>
        `}};re.styles=C`
        ${Be}
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
    `;Ce([u()],re.prototype,"metadata",2);Ce([u()],re.prototype,"baseUrl",2);Ce([b()],re.prototype,"state",2);Ce([b()],re.prototype,"data",2);Ce([u()],re.prototype,"appState",2);Ce([u()],re.prototype,"appData",2);Ce([u({type:Boolean})],re.prototype,"searchOnly",2);Ce([b()],re.prototype,"panelOpened",2);Ce([b()],re.prototype,"activeFilter",2);Ce([b()],re.prototype,"draftText",2);re=Ce([E("mateu-filter-bar")],re);var yr=Object.defineProperty,xr=Object.getOwnPropertyDescriptor,Kt=(e,t,a,i)=>{for(var s=i>1?void 0:i?xr(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&yr(t,a,s),s};let pt=class extends _{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const e=this.totalPages>1,t=this.pageNumber,a=t===0,i=t>=this.totalPages-1;return o`
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
                    <vaadin-button theme="tertiary icon" title="Next page" ?disabled="${i}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">
                        <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Last page" ?disabled="${i}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">
                        <vaadin-icon icon="vaadin:angle-double-right"></vaadin-icon>
                    </vaadin-button>
                    <span class="separator"></span>
                `:d}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </vaadin-horizontal-layout>
        `}};pt.styles=C`
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
    `;Kt([u()],pt.prototype,"totalElements",2);Kt([u()],pt.prototype,"pageSize",2);Kt([u()],pt.prototype,"pageNumber",2);Kt([b()],pt.prototype,"totalPages",2);pt=Kt([E("mateu-pagination")],pt);const wr=640,kr=e=>e>0&&e<wr?"accordion":"tabs";var Sr=Object.defineProperty,Cr=Object.getOwnPropertyDescriptor,va=(e,t,a,i)=>{for(var s=i>1?void 0:i?Cr(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Sr(t,a,s),s};let Ct=class extends _{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=kr(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(i=>"selected"in i);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return o`
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
                                <span>${e??d}</span>
                                <span class="chevron">⟩</span>
                            </button>
                            <div class="acc-body" id="acc-body-${t}" ?hidden="${t!=this.selected}">
                                <slot name="panel-${t}"></slot>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        `}};Ct.styles=C`
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
    `;va([u({type:Array})],Ct.prototype,"tabLabels",2);va([b()],Ct.prototype,"mode",2);va([b()],Ct.prototype,"selected",2);Ct=va([E("mateu-adaptive-tabs")],Ct);const Er=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style;return c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";"),l.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+l.itemRowSpacing+";"),l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 92px;"),l.fullWidth&&(c+="width: 100%;"),o`
               <vaadin-form-layout 
                       .responsiveSteps="${l.responsiveSteps||d}"  
                       style="${c||d}" 
                       class="${t.cssClasses}"
                       max-columns="${l.maxColumns&&l.maxColumns>0?l.maxColumns:d}"
                       auto-responsive="${l.autoResponsive||d}"
                       column-width="${l.columnWidth||d}"
                       expand-columns="${l.expandColumns||d}"
                       expand-fields="${l.expandFields||d}"
                       labels-aside="${l.labelsAside||d}"
                       slot="${t.slot||d}"
               >
                   ${t.children?.map(h=>wi(l,e,h,a,i,s,r,n))}
               </vaadin-form-layout>
            `},wi=(e,t,a,i,s,r,n,l)=>a.type==ie.ClientSide&&a.metadata?.type==v.FormRow?Ir(e,t,a,i,s,r,n,l):e.labelsAside?_r(t,a,i,s,r,n,l):x(t,a,i,s,r,n,l),_r=(e,t,a,i,s,r,n)=>{if(t.type==ie.ClientSide&&t.metadata?.type==v.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return o`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${x(e,t,a,i,s,r,n,!0)}
                       </vaadin-form-item>
                   `}return x(e,t,a,i,s,r,n)},Ir=(e,t,a,i,s,r,n,l)=>o`
        <vaadin-form-row>
            ${a.children?.map(c=>wi(e,t,c,i,s,r,n,l))}
        </vaadin-form-row>
            `,Tr=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let h=t.style;return l.fullWidth&&(h=h?"width: 100%;"+h:"width: 100%;"),l.justification&&(h=h?"justify-content: "+l.justification+";"+h:"justify-content: "+l.justification+";"),l.verticalAlignment&&(h=h?"align-items: "+l.verticalAlignment+";"+h:"align-items: "+l.verticalAlignment+";"),o`
               <vaadin-horizontal-layout 
                       style="${h}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(p=>x(e,p,a,i,s,r,n))}
               </vaadin-horizontal-layout>
            `},Pr=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let h=t.style;return l.fullWidth&&(h=h?"width: 100%;"+h:"width: 100%;"),l.justification&&(h=h?"justify-content: "+l.justification+";"+h:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(h=h?"align-items: "+l.horizontalAlignment+";"+h:"align-items: "+l.horizontalAlignment+";"),o`
        <vaadin-vertical-layout
                style="${h}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(p=>x(e,p,a,i,s,r,n))}
        </vaadin-vertical-layout>
    `},Or=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),o`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${x(e,t.children[0],a,i,s,r,n)}</master-content>
                   <detail-content>${x(e,t.children[1],a,i,s,r,n)}</detail-content>
               </vaadin-split-layout>
            `},Rr=(e,t,a,i,s,r,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,h=!!s?.hasDetail||!!l,p=c??l;return o`
               <vaadin-master-detail-layout ?has-detail="${h}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${x(e,t.children[0],a,i,s,r,n)}</div>
                   ${h&&p?o`<div slot="detail">${x(e,p,a,i,s,r,n)}</div>`:o`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},zr=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let h=l.variant;h=="equalWidth"&&(h="equal-width-tabs");const p=Math.max(0,(t.children??[]).findIndex(m=>m.metadata.active)),f=m=>{m.target.selected=p};if(l.adaptable){const m=(t.children??[]).map(w=>{const y=w.metadata.label;return y?.includes("${")?e._evalTemplate(y):y});return o`
            <mateu-adaptive-tabs
                    .tabLabels="${m}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??d}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${h??d}"
                             orientation="${l.orientation??d}"
                             @items-changed=${f}
                >
                    ${t.children?.map(w=>w).map((w,y)=>{const g=w.metadata.shortcut;return o`
                        <vaadin-tab id="${m[y]}"
                                    style="${w.style}"
                                    class="${w.cssClasses}"
                                    data-shortcut="${g??d}"
                        >${m[y]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((w,y)=>o`
                    <div slot="panel-${y}" style="padding: var(--lumo-space-m) 0;">
                        ${w.children?.map(g=>x(e,g,a,i,s,r,n))}
                    </div>`)}
            </mateu-adaptive-tabs>
                `}return o`
        <vaadin-tabsheet
                theme="${h??d}"
                style="${c}"
                slot="${t.slot??d}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${l.orientation??d}"
                         @items-changed=${f}
            >
                ${t.children?.map(m=>m).map(m=>{const w=m.metadata.label,y=w?.includes("${")?e._evalTemplate(w):w,g=m.metadata.shortcut;return o`
                    <vaadin-tab id="${y}"
                                style="${m.style}"
                                class="${m.cssClasses}"
                                data-shortcut="${g??d}"
                    >${y}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(m=>Dr(e,m,a,i,s,r,n))}
        </vaadin-tabsheet>
            `},Dr=(e,t,a,i,s,r,n)=>{const l=t.metadata.label,c=l?.includes("${")?e._evalTemplate(l):l;return o`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(h=>x(e,h,a,i,s,r,n))}
               </div>
            `},Lr=(e,t,a,i,s,r,n)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let h=0;h<t.children.length;h++)if(t.children[h].metadata?.active){c=h;break}}return o`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(h=>Ar(e,h,a,i,s,r,n,l.variant))}
               </vaadin-accordion>
            `},Ar=(e,t,a,i,s,r,n,l)=>{const c=t.metadata,h=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${h}</vaadin-accordion-heading>
            ${t.children?.map(p=>x(e,p,a,i,s,r,n))}
        </vaadin-accordion-panel>
            `},Fr=(e,t,a,i,s,r,n)=>o`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>x(e,l,a,i,s,r,n))}
               </vaadin-scroller>
            `,Nr=(e,t,a,i,s,r,n)=>o`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>x(e,l,a,i,s,r,n))}
               </div>
            `,qr=(e,t,a,i,s,r,n)=>o`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>x(e,l,a,i,s,r,n))}
               </div>
            `,Ur=(e,t,a,i,s,r,n)=>o`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??d}">
            ${t.children?.map(l=>x(e,l,a,i,s,r,n))}
        </vaadin-board>
            `,Mr=(e,t,a,i,s,r,n)=>o`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(l=>x(e,l,a,i,s,r,n))}
               </vaadin-board-row>
            `,Br=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${l.boardCols??d}"
        >
                   ${t.children?.map(c=>x(e,c,a,i,s,r,n))}
               </div>
            `},jr=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=h=>o`
            ${x(e,h,a,i,s,r,n)}
`;return o`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${Zi(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `},Wr=(e,t,a,i,s,r,n)=>{const l=t.metadata;if(l.tree){const h=async(p,f)=>{const m=p.parentItem?p.parentItem.children:l.page.content;f(m,m.length)};return o`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${h}"
                     slot="${t.slot??d}"
                     all-rows-visible
        >
            ${l.content.map((p,f)=>{const m=p.metadata;return f>0?o`
            <vaadin-grid-column path="${p.id}"
                                header="${m?.label??d}"
                                ?auto-width="${m?.autoWidth}"
                                flex-grow="${m?.flexGrow??d}"
                                width="${m?.width??d}"
                                .column="${p.metadata}"
                                ${qe((w,y,g)=>Qt(w,y,g,m,e,a,i,s,r,n),[])}></vaadin-grid-column>
`:o`
            <vaadin-grid-tree-column path="${p.id}"
                                header="${m?.label??d}"
                                ?auto-width="${m?.autoWidth}"
                                flex-grow="${m?.flexGrow??d}"
                                width="${m?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${lt()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&i&&i[t.id]&&(c=i[t.id]),c||(c=[]),o`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(h=>Da(h,e,a,i,s,r,n))}
        </vaadin-grid>
    `},Vr=e=>{const a=(e.metadata.items??[]).map(i=>({text:i.text,time:i.time,userName:i.userName,userImg:i.userImg,userAbbr:i.userAbbr,userColorIndex:i.userColorIndex}));return o`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                .items="${a}"
        ></vaadin-message-list>
    `},Hr=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-context-menu .items=${Aa(e,l.menu,a,i,s,r,n)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${x(e,l.wrapped,a,i,s,r,n)}
        </vaadin-context-menu>
            `},Gr=(e,t,a,i,s)=>{const r=t.metadata;return o`
        <vaadin-menu-bar .items=${Aa(e,r.options,a,i,s,W,Nt)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},Za=(e,t,a,i,s,r,n)=>{const l=document.createElement("vaadin-context-menu-item");return ui(x(e,t,a,i,s,r,n),l),l},Aa=(e,t,a,i,s,r,n)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Za(e,l.component,a,i,s,r,n):void 0,children:Aa(e,l.submenus,a,i,s,r,n)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?Za(e,l.component,a,i,s,r,n):void 0}),Kr=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-custom-field label="${l.label}"
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             slot="${t.slot??d}"
                             data-colspan="${l.colspan||d}"
        >
            ${x(e,l.content,a,i,s,r,n)}
        </vaadin-custom-field>
            `},Jr=e=>{const t=e.metadata,a=i=>{const s=i.detail?.value??"";!t.actionId||!s.trim()||i.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:s}},bubbles:!0,composed:!0}))};return o`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                @submit="${a}"
        ></vaadin-message-input>
    `},Yr=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <div id="show-notifications">${x(e,l.wrapped,a,i,s,r,n)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                for="show-notifications" text="${l.text}" position="top-start"></vaadin-tooltip>
    `},Xr=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const i=e[a];["number","string","boolean"].indexOf(typeof i)>=0&&(t[a]=e[a])}return t},ei=(e,t,a)=>{for(let i in t.attributes)e.setAttribute(i,t.attributes[i]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},Qr=e=>{const t=e.name;t.startsWith("vaadin-chart")&&!customElements.get(t)&&ae(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3]));const a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},Zr=(e,t,a)=>{Qr(t);let i=t.name;return t.attributes&&t.attributes.id&&(i="#"+t.attributes.id),setTimeout(()=>{const s=e.shadowRoot?.querySelector(".element-container")?.querySelector(i);if(s){for(;s.firstChild;)s.removeChild(s.lastChild);ei(s,t,a)}else{const r=document.createElement(t.name);ei(r,t,a);for(let n in t.on)r.addEventListener(n,l=>{const c=Xr(l);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),o`<div class="element-container"></div>`};var Te=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(Te||{});const eo=(e,t,a,i,s)=>{const r=e.metadata,n=r.attributes?.["data-colspan"],l=Pa(r.text,t,a,i,s);return Te.h1==r.container?o`
            <h1 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:Te.h2==r.container?o`
            <h2 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:Te.h3==r.container?o`
            <h3 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:Te.h4==r.container?o`
            <h4 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:Te.h5==r.container?o`
            <h5 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:Te.h6==r.container?o`
            <h6 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:Te.p==r.container?o`
               <p style="${e.style}" class="${e.cssClasses}"
                  id="${O(e.id)}"
                  data-colspan="${O(n)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:Te.div==r.container?o`
               <div style="${e.style}" class="${e.cssClasses}"
                    id="${O(e.id)}"
                    data-colspan="${O(n)}"
                    slot="${e.slot??d}">${l?ge(l):d}</div>
            `:Te.span==r.container?o`
               <span style="${e.style}" class="${e.cssClasses}"
                     id="${O(e.id)}"
                     data-colspan="${O(n)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:o`
               <p
                       id="${O(e.id)}"
                       data-colspan="${O(n)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${r.container} 
               </p>
            `},to=e=>{const t=e.metadata;return o`<a href="${t.url}" style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},ao=(e,t)=>{const a=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a,parameters:t.parameters},bubbles:!0,composed:!0}))},io=(e,t,a)=>{const i=e.metadata,s=$e(i.label,t,a);let r="";return i.buttonStyle&&(r+=" "+i.buttonStyle),i.color&&i.color!=="none"&&i.color!=="normal"&&(r+=" "+i.color),i.size&&i.size!=="none"&&i.size!=="normal"&&(r+=" "+i.size),o`<vaadin-button
id="${e.id}"
            data-action-id="${i.actionId}"
            @click="${n=>ao(n,i)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${i.disabled}"
            title="${i.shortcut?`${s} (${ys(i.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${i.iconOnLeft?o`<vaadin-icon icon="${i.iconOnLeft}"></vaadin-icon>`:d}${s}${i.iconOnRight?o`<vaadin-icon icon="${i.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},so=(e,t,a,i,s,r,n)=>{const l=t.metadata;if(!l)return o``;let c="";return l.variants?.map(h=>h=="stretchMedia"?"stretch-media":h=="coverMedia"?"cover-media":h).forEach(h=>c+=" "+h),c=c.trim(),o`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?nt(e,l.media,a,i,s,r,n,"media",!1):d}
            ${l.title?nt(e,l.title,a,i,s,r,n,"title",!1):d}
            ${l.subtitle?nt(e,l.subtitle,a,i,s,r,n,"subtitle",!1):d}
            ${l.header?nt(e,l.header,a,i,s,r,n,"header",!1):d}
            ${l.headerPrefix?nt(e,l.headerPrefix,a,i,s,r,n,"header-prefix",!1):d}
            ${l.headerSuffix?nt(e,l.headerSuffix,a,i,s,r,n,"header-suffix",!1):d}
            ${l.footer?nt(e,l.footer,a,i,s,r,n,"footer",!1):d}
            ${l.content?x(e,l.content,a,i,s,r,n,!1):d}
        </vaadin-card>
    `},ro=e=>{const t=e.metadata;return o`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},oo=e=>{const t=e.metadata;return o`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??d}"></vaadin-icon>
    `},no=(e,t,a,i,s,r,n)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=mi(l.openedCondition,i,s,r,n)}catch(h){console.error("when evaluating "+l.openedCondition+" :"+h+", where data is "+s+" and state is "+i)}return o`
        <vaadin-confirm-dialog
  header="${l.header}"
  ?cancel-button-visible="${l.canCancel}"
  ?reject-button-visible="${l.canReject}"
  reject-text="${l.rejectText}"
  confirm-text="${l.confirmText}"
  .opened="${c}"
  style="${t.style}" class="${t.cssClasses}"
  slot="${t.slot??d}"
>
  ${t.children?.map(h=>x(e,h,a,i,s,r,n))}
</vaadin-confirm-dialog>
            `},lo=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),o`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??d}"
                               position="${a??d}"
                               cookie-name="${t.cookieName??d}"
                               .message="${t.message??d}"
                               theme="${t.theme??d}"
                               .learnMore="${t.learnMore??d}"
                               .learnMoreLink="${t.learnMoreLink??d}"
                               .dismiss="${t.dismiss??d}"
        ></mateu-cookie-consent>
    `},co=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-details 
                ?opened="${l.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${x(e,l.summary,a,i,s,r,n)}
            </vaadin-details-summary>
            ${x(e,l.content,a,i,s,r,n)}
        </vaadin-details>
            `},ho=(e,t,a,i,s,r)=>o`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${i}"
            .appState="${s}"
            .appdata="${r}"
        ></mateu-dialog>
            `,uo=(e,t,a,i,s,r)=>o`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${i}"
            .appState="${s}"
            .appdata="${r}"
        ></mateu-drawer>
            `,po=e=>{const t=e.metadata;return o`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${ce()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},mo=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},vo=e=>{const t=e.metadata;return o`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${hi(()=>o`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},fo=(e,t={})=>{const a=e.metadata,i=a.valueKey?t[a.valueKey]:a.value;return o`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${a.indeterminate}"
                min="${a.min&&a.min!=0?a.min:d}"
                max="${a.max&&a.max!=0?a.max:d}"
                value="${i??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
        ></vaadin-progress-bar>
        ${a.text?o`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:d}
        </div>
    `},bo=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <div id="show-notifications">${x(e,l.wrapped,a,i,s,r,n)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                slot="${t.slot??d}"
                ${ci(()=>o`${x(e,l.content,a,i,s,r,n)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},go=e=>{const t=e.metadata;return o`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},$o=e=>{const t=e.metadata;return o`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},yo=e=>{const t=e.metadata;return o`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??d}">
        ${t.breadcrumbs.map(a=>o`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},xo=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>o`<div>${x(e,c,a,i,s,r,n)}</div>`)}
        </skeleton-carousel>
    `},wo=(e,t,a,i)=>{const s=e.metadata;return o`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${s.menu.map(r=>ki(r))}
        </div>
            `},ki=e=>o`
        ${e.submenus?o`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>ki(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:o`
                <a href="${e.path}">${e.label}</a>
        `}
        `,ko=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?ge(l.content):d}${t.children?.map(c=>x(e,c,a,i,s,r,n))}</div>
    `},So=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`<vaadin-card
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?o`<div slot="title" style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color);">${c}</div>`:d}
        ${t.children?.map(h=>x(e,h,a,i,s,r,n))}
    </vaadin-card>
    `},Co=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(h=>x(e,h,a,i,s,r,n))}</div>
    `},_a=(e,t,a,i,s,r,n,l)=>{const c=t.metadata,h=c?.fabs??[];return o`<mateu-page
            .component="${t}"
            baseUrl="${a}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            slot="${t.slot??d}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(p=>x(e,p,a,i,s,r,n))}
        ${c?.buttons?.map(p=>o`
                   ${x(e,{id:p.actionId,metadata:p,type:ie.ClientSide,slot:"buttons"},void 0,i,s,r,n)}
`)}
        ${h.map((p,f)=>o`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+f*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:p.actionId},bubbles:!0,composed:!0}))}"
                title="${p.label}">
                <vaadin-icon icon="${p.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},Ia=(e,t,a,i,s,r,n,l)=>o`<mateu-table-crud
            id="${t.id}"
            baseUrl="${a}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>x(e,c,a,i,s,r,n))}
    </mateu-table-crud>`,Eo=e=>{const t=e.metadata;return o`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},_o=(e,t,a)=>{const i=e.metadata;return o`<mateu-chat sseUrl="${i.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},Io=e=>{const t=e.metadata;return o`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},To=e=>{const t=e.metadata;return o`
        <mateu-workflow-elk
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},Po=e=>{const t=e.metadata;return o`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},Si=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Oo=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",Ro=e=>e=="up"?"▲":e=="down"?"▼":"",zo=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Do=e=>{const t=e.metadata,a=!!t.actionId;return o`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${Si} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${a?"button":d}"
             @click="${i=>zo(i,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?o`<vaadin-icon icon="${t.icon}" style="color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"></vaadin-icon>`:d}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?o`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:d}
            </div>
            ${t.trend||t.trendLabel?o`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Oo(t.trend)};">
                    ${Ro(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?o`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},Lo=(e,t,a,i,s,r,n)=>o`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>x(e,l,a,i,s,r,n))}
        </div>
    `,Ao=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",h=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"";return o`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${Si} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${h} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?o`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(p=>x(e,p,a,i,s,r,n))}
            </div>
        </div>
    `},Fo=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(h=>x(e,h,a,i,s,r,n))}
        </div>
    `};var No=Object.defineProperty,qo=Object.getOwnPropertyDescriptor,Fa=(e,t,a,i)=>{for(var s=i>1?void 0:i?qo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&No(t,a,s),s};let Mt=class extends _{constructor(){super(...arguments),this.panels=[],this.openPanels=new Set,this.initialized=!1}willUpdate(){!this.initialized&&this.panels.length&&(this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0)),this.initialized=!0)}toggle(e){const t=new Set(this.openPanels);t.has(e)?t.delete(e):t.add(e),this.openPanels=t}render(){return o`
            <div class="overview" part="overview">
                <slot name="overview"></slot>
            </div>
            <div class="rail" part="rail">
                ${this.panels.map((e,t)=>this.openPanels.has(t)?o`
                    <div class="panel" part="panel">
                        <div class="panel-header">
                            <div>
                                <h3>${e.title}</h3>
                                ${e.subtitle?o`<div class="subtitle">${e.subtitle}</div>`:""}
                            </div>
                            <button class="fold" title="Fold" @click="${()=>this.toggle(t)}">⟨</button>
                        </div>
                        <div style="flex: 1; min-height: 0;">
                            <slot name="panel-${t}"></slot>
                        </div>
                    </div>
                `:o`
                    <div class="strip" role="button" title="${e.title}" @click="${()=>this.toggle(t)}">
                        <button class="fold" tabindex="-1">⟩</button>
                        <span>${e.title}</span>
                    </div>
                `)}
            </div>
        `}};Mt.styles=C`
        :host {
            display: flex;
            gap: var(--lumo-space-m, 1rem);
            align-items: stretch;
            min-height: 24rem;
        }
        .overview {
            flex: 0 0 20rem;
            min-width: 0;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: var(--lumo-space-m, 1rem);
            box-sizing: border-box;
            overflow: auto;
        }
        .rail {
            display: flex;
            gap: var(--lumo-space-s, .5rem);
            flex: 1;
            min-width: 0;
            overflow-x: auto;
            align-items: stretch;
        }
        .panel {
            flex: 1 1 22rem;
            min-width: 18rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: var(--lumo-space-m, 1rem);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            overflow: auto;
        }
        .panel-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: .5rem;
        }
        .panel-header h3 {
            margin: 0;
            font-size: var(--lumo-font-size-l, 1.125rem);
        }
        .panel-header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .strip {
            flex: 0 0 2.75rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
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
            border: none;
            background: none;
            cursor: pointer;
            color: var(--lumo-secondary-text-color, #666);
            font-size: 1rem;
            padding: 0;
            line-height: 1;
        }
    `;Fa([u({type:Array})],Mt.prototype,"panels",2);Fa([b()],Mt.prototype,"openPanels",2);Mt=Fa([E("mateu-foldout")],Mt);const Uo=(e,t,a,i,s,r,n)=>{const l=t.metadata;return o`
        <mateu-foldout
                .panels="${l.panels??[]}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>x(e,c,a,i,s,r,n))}
        </mateu-foldout>
    `},Mo=(e,t,a,i,s,r,n)=>{const l=t.metadata,c=!!l.image,h=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",p=l.centered===!1?"flex-start":"center",f=l.centered===!1?"left":"center";return o`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${p}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${f}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${h} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?o`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${p}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(m=>x(e,m,a,i,s,r,n))}
                </div>
            `:d}
        </div>
    `};var Bo=Object.defineProperty,jo=Object.getOwnPropertyDescriptor,Ci=(e,t,a,i)=>{for(var s=i>1?void 0:i?jo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Bo(t,a,s),s};const ka=1440*60*1e3;let Zt=class extends _{constructor(){super(...arguments),this.tasks=[]}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-ka,max:Math.max(...e)+2*ka}:null}months(e,t){const a=[],i=new Date(e);for(i.setDate(1);i.getTime()<=t;){const s=Math.max(i.getTime(),e),r=new Date(i.getFullYear(),i.getMonth()+1,1),n=Math.min(r.getTime(),t);a.push({label:i.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:s,to:n}),i.setMonth(i.getMonth()+1)}return a}render(){const e=this.range();if(!e)return o``;const t=e.max-e.min,a=s=>(s-e.min)/t*100,i=Date.now();return o`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(s=>o`
                        <div class="month" style="width: ${(s.to-s.from)/t*100}%;">${s.label}</div>
                    `)}
                </div>
                ${this.tasks.map(s=>{const r=new Date(s.start+"T00:00:00").getTime(),n=new Date(s.end+"T00:00:00").getTime()+ka;return o`
                        <div class="label" title="${s.title}">${s.title}</div>
                        <div class="lane">
                            ${i>=e.min&&i<=e.max?o`<div class="today" style="left: ${a(i)}%;"></div>`:d}
                            <div class="bar"
                                 title="${s.title} · ${s.start} → ${s.end}${s.progress?` · ${s.progress}%`:""}"
                                 style="left: ${a(r)}%; width: ${(n-r)/t*100}%; ${s.color?`--mateu-gantt-fill: ${s.color};`:""}">
                                <div class="fill" style="width: ${s.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};Zt.styles=C`
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
    `;Ci([u({type:Array})],Zt.prototype,"tasks",2);Zt=Ci([E("mateu-gantt")],Zt);const Wo=e=>{const t=e.metadata;return o`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `};var Vo=Object.defineProperty,Ho=Object.getOwnPropertyDescriptor,Ei=(e,t,a,i)=>{for(var s=i>1?void 0:i?Ho(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Vo(t,a,s),s};let ea=class extends _{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};ea.styles=C`
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
    `;Ei([u({type:Array})],ea.prototype,"columns",2);ea=Ei([E("mateu-kanban")],ea);const Go=e=>{const t=e.metadata;return o`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-kanban>
    `};var Ko=Object.defineProperty,Jo=Object.getOwnPropertyDescriptor,_i=(e,t,a,i)=>{for(var s=i>1?void 0:i?Jo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ko(t,a,s),s};let ta=class extends _{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};ta.styles=C`
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
    `;_i([u({type:Array})],ta.prototype,"items",2);ta=_i([E("mateu-timeline")],ta);const Yo=e=>{const t=e.metadata;return o`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-timeline>
    `};var Xo=Object.defineProperty,Qo=Object.getOwnPropertyDescriptor,Ii=(e,t,a,i)=>{for(var s=i>1?void 0:i?Qo(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Xo(t,a,s),s};let aa=class extends _{constructor(){super(...arguments),this.steps=[]}render(){return o`
            <div class="steps">
                ${this.steps.map((e,t)=>{const a=e.status??"upcoming";return o`
                        <div class="step ${a}">
                            <div class="connector"></div>
                            <div class="dot">${a==="done"?"✓":t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?o`<div class="desc">${e.description}</div>`:d}
                        </div>
                    `})}
            </div>
        `}};aa.styles=C`
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
            top: 1rem;
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
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: .85rem;
            background: var(--lumo-contrast-10pct, #e5e7eb);
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
            margin-top: .4rem;
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
    `;Ii([u({type:Array})],aa.prototype,"steps",2);aa=Ii([E("mateu-progress-steps")],aa);const Zo=e=>{const t=e.metadata;return o`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-progress-steps>
    `};var en=Object.defineProperty,tn=Object.getOwnPropertyDescriptor,at=(e,t,a,i)=>{for(var s=i>1?void 0:i?tn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&en(t,a,s),s};let Oe=class extends _{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return d;const t=84,a=30,i=2,s=Math.min(...e),n=Math.max(...e)-s||1,l=(t-i*2)/(e.length-1),c=e.map((m,w)=>{const y=i+w*l,g=i+(a-i*2)*(1-(m-s)/n);return[y,g]}),h=c.map(([m,w],y)=>`${y===0?"M":"L"}${m.toFixed(1)} ${w.toFixed(1)}`).join(" "),p=`${h} L${c[c.length-1][0].toFixed(1)} ${a} L${c[0][0].toFixed(1)} ${a} Z`,f=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return N`
            <svg width="${t}" height="${a}" viewBox="0 0 ${t} ${a}">
                <path d="${p}" fill="${f}" opacity="0.12"></path>
                <path d="${h}" fill="none" stroke="${f}" stroke-width="1.6"
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
        `}};Oe.styles=C`
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
    `;at([u()],Oe.prototype,"label",2);at([u()],Oe.prototype,"value",2);at([u()],Oe.prototype,"unit",2);at([u()],Oe.prototype,"delta",2);at([u()],Oe.prototype,"trend",2);at([u({type:Array})],Oe.prototype,"spark",2);at([u()],Oe.prototype,"actionId",2);Oe=at([E("mateu-stat")],Oe);const an=e=>{const t=e.metadata;return o`
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
    `};var sn=Object.defineProperty,rn=Object.getOwnPropertyDescriptor,Na=(e,t,a,i)=>{for(var s=i>1?void 0:i?rn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&sn(t,a,s),s};let Bt=class extends _{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),a=e.getMonth(),i=new Date(t,a,1),s=(i.getDay()+6)%7,r=new Date(t,a+1,0).getDate(),n=new Date,l=m=>n.getFullYear()===t&&n.getMonth()===a&&n.getDate()===m,c={};for(const m of this.events){if(!m.date)continue;const w=new Date(m.date+"T00:00:00");w.getFullYear()===t&&w.getMonth()===a&&(c[w.getDate()]??=[]).push(m)}const h=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],p=[];for(let m=0;m<s;m++)p.push(o`<div class="cell blank"></div>`);for(let m=1;m<=r;m++)p.push(o`
                <div class="cell ${l(m)?"today":""}">
                    <span class="num">${m}</span>
                    ${(c[m]??[]).map(w=>o`
                        <span class="chip ${w.actionId?"clickable":""}"
                              style="${w.color?`--mateu-cal-accent: ${w.color};`:""}"
                              title="${w.title??""}"
                              @click="${()=>this.clickEvent(w)}">${w.title}</span>
                    `)}
                </div>
            `);const f=i.toLocaleDateString(void 0,{month:"long",year:"numeric"});return o`
            <div class="title">${f}</div>
            <div class="grid">
                ${h.map(m=>o`<div class="dow">${m}</div>`)}
                ${p}
            </div>
        `}};Bt.styles=C`
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
    `;Na([u()],Bt.prototype,"month",2);Na([u({type:Array})],Bt.prototype,"events",2);Bt=Na([E("mateu-calendar")],Bt);const on=e=>{const t=e.metadata;return o`
        <mateu-calendar
                month="${t.month??d}"
                .events="${t.events??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-calendar>
    `};var nn=Object.defineProperty,ln=Object.getOwnPropertyDescriptor,Ti=(e,t,a,i)=>{for(var s=i>1?void 0:i?ln(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&nn(t,a,s),s};let ia=class extends _{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return o`
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
        `}};ia.styles=C`
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
    `;Ti([u({type:Array})],ia.prototype,"plans",2);ia=Ti([E("mateu-pricing-table")],ia);const dn=e=>{const t=e.metadata;return o`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-pricing-table>
    `};var cn=Object.defineProperty,hn=Object.getOwnPropertyDescriptor,Pi=(e,t,a,i)=>{for(var s=i>1?void 0:i?hn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&cn(t,a,s),s};let sa=class extends _{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,a=t&&(t.startsWith("http")||t.startsWith("data:"));return o`
            <li>
                <div class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}">
                    ${t?o`<span class="avatar">${a?o`<img src="${t}" alt="">`:t}</span>`:d}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?o`<span class="subtitle">${e.subtitle}</span>`:d}
                </div>
                ${e.children&&e.children.length?o`<ul>${e.children.map(i=>this.renderNode(i))}</ul>`:d}
            </li>
        `}render(){return this.root?o`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:o``}};sa.styles=C`
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
    `;Pi([u({attribute:!1})],sa.prototype,"root",2);sa=Pi([E("mateu-org-chart")],sa);const un=e=>{const t=e.metadata;return o`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-org-chart>
    `};var pn=Object.defineProperty,mn=Object.getOwnPropertyDescriptor,Oi=(e,t,a,i)=>{for(var s=i>1?void 0:i?mn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&pn(t,a,s),s};const vn=1440*60*1e3;let ra=class extends _{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const a=e/t,i=a>.75?1:a>.5?.75:a>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(i*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return o``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),a=Math.min(...t),i=Math.max(...t),s=new Date(a);s.setDate(s.getDate()-(s.getDay()+6)%7);const r={};for(const c of e)r[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),l=[];for(let c=s.getTime();c<=i;c+=vn){const h=new Date(c),p=h.toISOString().slice(0,10),f=r[p],m=f?.value??0,w=(h.getDay()+6)%7+1,y=f?.label??`${p}: ${m}`;l.push(o`
                <div class="cell" style="grid-row: ${w}; --cell: ${this.color(m,n)};" title="${y}"></div>
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
        `}};ra.styles=C`
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
    `;Oi([u({type:Array})],ra.prototype,"cells",2);ra=Oi([E("mateu-heatmap")],ra);const fn=e=>{const t=e.metadata;return o`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-heatmap>
    `};var bn=Object.defineProperty,gn=Object.getOwnPropertyDescriptor,Ri=(e,t,a,i)=>{for(var s=i>1?void 0:i?gn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&bn(t,a,s),s};let oa=class extends _{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return o``;const t=e[0].value??0,a=Math.max(...e.map(i=>i.value??0),1);return o`
            <div class="funnel">
                ${e.map((i,s)=>{const r=i.value??0,n=a>0?Math.max(6,r/a*100):6,l=s>0?e[s-1].value??0:t,c=s===0?t>0?"100%":"":l>0?`${Math.round(r/l*100)}%`:"0%";return o`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${i.label}</span>
                                ${s>0?o`<span class="conv">${c} of previous</span>`:d}
                            </div>
                            <div class="bar" style="width: ${n}%; ${i.color?`--bar: ${i.color};`:""}">
                                ${r.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};oa.styles=C`
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
    `;Ri([u({type:Array})],oa.prototype,"stages",2);oa=Ri([E("mateu-funnel")],oa);const $n=e=>{const t=e.metadata;return o`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-funnel>
    `};var yn=Object.defineProperty,xn=Object.getOwnPropertyDescriptor,Pt=(e,t,a,i)=>{for(var s=i>1?void 0:i?xn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&yn(t,a,s),s};let Ze=class extends _{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return o``;const t=600,a=160,i=8,s=Math.min(...e),r=Math.max(...e),n=r-s||1,l=(t-i*2)/(e.length-1),c=e.map((y,g)=>{const I=i+g*l,B=i+(a-i*2)*(1-(y-s)/n);return[I,B]}),h=c.map(([y,g],I)=>`${I===0?"M":"L"}${y.toFixed(1)} ${g.toFixed(1)}`).join(" "),p=`${h} L${c[c.length-1][0].toFixed(1)} ${a-i} L${c[0][0].toFixed(1)} ${a-i} Z`,f=this.color||"var(--lumo-primary-color, #1a73e8)",m=e.indexOf(r),w=e.indexOf(s);return o`
            ${this.heading?o`<div class="title">${this.heading}</div>`:d}
            <svg viewBox="0 0 ${t} ${a}" preserveAspectRatio="none">
                ${this.area?N`<path d="${p}" fill="${f}" opacity="0.12"></path>`:d}
                <path d="${h}" fill="none" stroke="${f}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((y,g)=>g===m||g===w?N`<circle cx="${y[0]}" cy="${y[1]}" r="3.2" fill="${f}"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`:N`<circle cx="${y[0]}" cy="${y[1]}" r="6" fill="transparent"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?o`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:d}
        `}};Ze.styles=C`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;Pt([u()],Ze.prototype,"heading",2);Pt([u({type:Array})],Ze.prototype,"values",2);Pt([u({type:Array})],Ze.prototype,"labels",2);Pt([u()],Ze.prototype,"color",2);Pt([u({type:Boolean})],Ze.prototype,"area",2);Ze=Pt([E("mateu-trend-chart")],Ze);const wn=e=>{const t=e.metadata;return o`
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
    `},kn=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},Sn=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==v.Button){const i=a;t[e.id+".disabled"]==!0&&(i.disabled=!0)}if(a.type==v.FormField){const i=a;t[e.id+".disabled"]==!0&&(i.disabled=!0)}}return a},P=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),Cn={[v.Bpmn]:({component:e})=>Eo(e),[v.Workflow]:({component:e})=>Io(e),[v.WorkflowElk]:({component:e})=>To(e),[v.FormEditor]:({component:e})=>Po(e),[v.Page]:P(_a),[v.Div]:P(ko),[v.Directory]:({component:e,baseUrl:t,state:a,data:i})=>wo(e),[v.FormLayout]:P(Er),[v.HorizontalLayout]:P(Tr),[v.VerticalLayout]:P(Pr),[v.SplitLayout]:P(Or),[v.MasterDetailLayout]:P(Rr),[v.TabLayout]:P(zr),[v.AccordionLayout]:P(Lr),[v.BoardLayout]:P(Ur),[v.BoardLayoutRow]:P(Mr),[v.BoardLayoutItem]:P(Br),[v.Scroller]:P(Fr),[v.FullWidth]:P(Nr),[v.Container]:P(qr),[v.Form]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:n})=>{const l=t.metadata;return o`<mateu-form
            id="${t.id}"
        baseUrl="${a}"
            .component="${t}"
            .values="${i}"
            .state="${i}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>x(e,c,a,i,s,r,n))}
            ${l?.buttons?.map(c=>o`
               ${x(e,{id:c.actionId,metadata:c,type:ie.ClientSide,slot:"buttons"},void 0,i,s,r,n)}
`)}

            </mateu-form>`},[v.Table]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:n})=>o`<mateu-table
                        id="${t.id}"
        baseUrl="${a}"
            .metadata="${t.metadata}"
            .state="${i}"
                        .data="${s}"
                        .appState="${r}"
                        .appDate="${n}"
                        style="${t.style}" class="${t.cssClasses}"
                        slot="${t.slot??d}"
            >
             ${t.children?.map(l=>x(e,l,a,i,s,r,n))}
            </mateu-table>`,[v.Crud]:P(Ia),[v.App]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:n})=>o`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${a}"
                        .component="${t}"
                        .state="${i}"
                        .data="${s}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${r}"
                        .appData="${n}"
            >
             ${t.children?.map(l=>x(e,l,a,i,s,r,n))}
         </mateu-app>`,[v.Element]:({container:e,component:t})=>Zr(e,t.metadata,t),[v.FormField]:({container:e,component:t,baseUrl:a,state:i,data:s,appState:r,appData:n,labelAlreadyRendered:l})=>{const c=t.metadata;return o`
    <mateu-field
                   id="${t.id}"
                   .component="${t}"
            .field="${t.metadata}"
                   .state="${i}"
                   .data="${s}"
                   .appState="${r}"
                   .appdata="${n}"
                   style="${t.style}" class="${t.cssClasses}"
                   slot="${t.slot??d}"
                   data-colspan="${c.colspan}"
                   .labelAlreadyRendered="${l}"
            >
                    ${t.children?.map(h=>x(e,h,a,i,s,r,n,l))}
                </mateu-field>
        `},[v.Text]:({component:e,state:t,data:a,appState:i,appData:s})=>eo(e,t,a,i,s),[v.Avatar]:({component:e,state:t,data:a})=>er(e,t,a),[v.Chat]:({component:e,state:t,data:a})=>_o(e),[v.AvatarGroup]:({component:e})=>tr(e),[v.Badge]:({component:e,state:t,data:a})=>sr(e,t,a),[v.Breadcrumbs]:({component:e})=>yo(e),[v.Anchor]:({component:e})=>to(e),[v.Button]:({component:e,state:t,data:a})=>io(e,t,a),[v.Card]:P(so),[v.Chart]:({component:e})=>ro(e),[v.Icon]:({component:e})=>oo(e),[v.ConfirmDialog]:P(no),[v.ContextMenu]:P(Hr),[v.CookieConsent]:({component:e})=>lo(e),[v.Details]:P(co),[v.Dialog]:({component:e,baseUrl:t,state:a,data:i,appState:s,appData:r})=>ho(e,t,a,i,s,r),[v.Drawer]:({component:e,baseUrl:t,state:a,data:i,appState:s,appData:r})=>uo(e,t,a,i,s,r),[v.Image]:({component:e})=>$o(e),[v.Map]:({component:e})=>go(e),[v.Markdown]:({component:e})=>mo(e),[v.MicroFrontend]:({component:e})=>po(e),[v.Notification]:({component:e})=>vo(e),[v.ProgressBar]:({component:e,state:t})=>fo(e,t),[v.Popover]:P(bo),[v.CarouselLayout]:P(xo),[v.Tooltip]:P(Yr),[v.MessageInput]:({component:e})=>Jr(e),[v.MessageList]:({component:e})=>Vr(e),[v.CustomField]:P(Kr),[v.MenuBar]:({container:e,component:t,baseUrl:a,state:i,data:s})=>Gr(e,t,a,i,s),[v.Grid]:P(Wr),[v.VirtualList]:P(jr),[v.FormSection]:P(So),[v.FormSubSection]:P(Co),[v.MetricCard]:({component:e})=>Do(e),[v.Scoreboard]:P(Lo),[v.DashboardPanel]:P(Ao),[v.DashboardLayout]:P(Fo),[v.FoldoutLayout]:P(Uo),[v.HeroSection]:P(Mo),[v.EmptyState]:({component:e})=>mr(e),[v.Skeleton]:({component:e})=>vr(e),[v.Gantt]:({component:e})=>Wo(e),[v.Kanban]:({component:e})=>Go(e),[v.Timeline]:({component:e})=>Yo(e),[v.ProgressSteps]:({component:e})=>Zo(e),[v.Stat]:({component:e})=>an(e),[v.Calendar]:({component:e})=>on(e),[v.PricingTable]:({component:e})=>dn(e),[v.OrgChart]:({component:e})=>un(e),[v.Heatmap]:({component:e})=>fn(e),[v.Funnel]:({component:e})=>$n(e),[v.TrendChart]:({component:e})=>wn(e)},qa=(e,t,a,i,s,r,n,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),o`<p>No metadata for component</p>`):qa(e,{id:ce(),metadata:t,type:ie.ClientSide},a,i,s,r,n,l);const c=t.metadata.type,h={...t,style:kn(t,s),metadata:Sn(t,s)},p=Cn[c];return p?p({container:e,component:h,baseUrl:a,state:i,data:s,appState:r,appData:n,labelAlreadyRendered:l}):o`<p ${h?.slot??d}>Unknown metadata type ${c} for component ${h?.id}</p>`};var En=Object.defineProperty,_n=Object.getOwnPropertyDescriptor,me=(e,t,a,i)=>{for(var s=i>1?void 0:i?_n(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&En(t,a,s),s};let Y=class extends _{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;t(a?.content??[],a?.content?.length??0)},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},i=new IntersectionObserver(s=>{s.forEach(r=>{t(r.intersectionRatio>0)})},a);i.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?qa(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?o`<vaadin-card
        >
                ${e.title?o`
                    <div slot="title">${e.title}</div>
                `:d}
                ${e.subtitle?o`
                    <div slot="subtitle">${e.subtitle}</div>
                `:d}
                ${e.content?o`
                    <div>${e.content}</div>
                `:d}
                ${e.status?o`
                    <span slot="header-suffix" theme="badge ${ma(e.status.type)}">${e.status.message}</span>
                `:d}
                ${e.image?o`
                    <img slot="media" src="${e.image}" alt="" />
                `:d}
                
        </vaadin-card>`:o`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return o`
            <div class="card-container">
                ${e?.content?.map(t=>o`<div @click="${()=>this.clickedOnCard(t)}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};Y.styles=C`
        ${Be}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;me([u()],Y.prototype,"id",2);me([u()],Y.prototype,"metadata",2);me([u()],Y.prototype,"baseUrl",2);me([u()],Y.prototype,"state",2);me([u()],Y.prototype,"data",2);me([u()],Y.prototype,"appState",2);me([u()],Y.prototype,"appData",2);me([u()],Y.prototype,"emptyStateMessage",2);me([b()],Y.prototype,"keepAsking",2);me([ke("#ask-for-more")],Y.prototype,"askForMore",2);me([b()],Y.prototype,"hasMore",2);Y=me([E("mateu-card-list")],Y);var zi=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(zi||{}),Di=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(Di||{});const In=76;function ti(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const a=e.dataType??"";return a==="bool"?1:a==="status"||a==="integer"?1.5:a==="number"||a==="date"||a==="money"?2:a==="dateTime"||a==="dateRange"?2.5:3}function Tn(e,t){if(e.length===0)return"table";const a=e.reduce((c,h)=>c+ti(h),0),i=t/In,s=a/i;if(s<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=r.reduce((c,h)=>c+ti(h),0);return s>1.6||e.length>10?"masterDetail":r.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function Pn(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}var On=Object.defineProperty,Rn=Object.getOwnPropertyDescriptor,Ee=(e,t,a,i)=>{for(var s=i>1?void 0:i?Rn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&On(t,a,s),s};const zn={asc:"ascending",desc:"descending"};let oe=class extends _{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{Wt.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?zn[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>$e(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get cols(){return this.component?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":Tn(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(l=>a.delete(l)),a.delete("page"),a.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&a.set(l,String(c))});const i=this.state.page;i&&i>0&&a.set("page",String(i));const s=this.state.sort;if(s&&s.length>0){const l=s.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&a.set("sort",l)}const r=a.toString(),n=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),i=this._filterIds(e),s={...t};a.forEach((l,c)=>{i.has(c)&&(s[c]=l)});const r=a.get("page");if(r!==null){const l=parseInt(r,10);!isNaN(l)&&l>0&&(s.page=l)}const n=a.get("sort");if(n){const l=n.split(",").map(c=>{const[h,p]=c.split(":");return h&&p?{fieldId:h,direction:p}:null}).filter(Boolean);l.length>0&&(s.sort=l)}return s}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const a=this.component?.metadata,i=a.initialPage&&a.initialPage>0?a.initialPage:0;this.state=this._initStateFromUrl(a,{...this.state,size:a.pageSize,page:i,sort:[]}),(this.state.page!==i||this.state.sort?.length>0||[...this._filterIds(a)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=$=>{const R=[];return $.color&&$.color!==zi.normal&&R.push($.color),$.buttonStyle&&R.push($.buttonStyle===Di.tertiaryInline?"tertiary-inline":$.buttonStyle),R.length?R.join(" "):void 0},t=$=>$==="back"||$==="backToList"||!!$&&$.startsWith("cancel"),a=$=>{const R=M.get()?.renderToolbarButton?.($,this.evalLabel($.label),()=>this.handleToolbarButtonClick($.actionId));return R||o`
                <vaadin-button
                        data-action-id="${$.id}"
                        theme="${e($)||d}"
                        @click="${()=>this.handleToolbarButtonClick($.actionId)}"
                >${this.evalLabel($.label)}</vaadin-button>
            `};if(!this.component)return o`no component`;const i=this.component.metadata;i.serverSideOrdering=!0;const s=i?.toolbar??[],r=s.filter($=>t($.actionId)),n=s.filter($=>!t($.actionId)),l=r.length>0&&n.length>0,c=!!i?.title||!!i?.subtitle||s.length>0,h=this.effectiveGridLayout,p=this.cols,f=Pn(p),m=this.data[this.id]?.page?.content??[],w=this.state[this.component?.id]?.emptyStateMessage,y=($,R)=>{const S=R[$.id];if(S==null)return o``;if($.dataType==="status"){const j=ma(S.type);return o`<span theme="badge pill ${j}">${S.message}</span>`}return $.dataType==="bool"?o`${S?"✓":"✗"}`:typeof S=="object"?o`${S.label??S.name??S.message??""}`:o`${S}`},g=()=>{const $=this.identifierFieldName,R=this.state._selectedId??this.appState?._splitDetailId,S=f.find(T=>T.identifier)??f[0],j=T=>T.dataType==="action"||T.dataType==="actionGroup"||T.dataType==="menu"||T.stereotype==="button",st=f.filter(T=>T!==S&&!j(T)),$t=p.filter(T=>j(T)),Ve=(T,J,de)=>{T.stopPropagation(),T.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:J,parameters:{_clickedRow:de}},bubbles:!0,composed:!0}))},yt=T=>{const J=[];for(const de of $t){const D=T[de.id];if(de.dataType==="action"){const z=D?.methodNameInCrud?D:T.action?.methodNameInCrud?T.action:{methodNameInCrud:de.id,label:de.label,icon:null};J.push(o`
                            <vaadin-button theme="tertiary small" title="${z.label||d}"
                                @click="${k=>Ve(k,"action-on-row-"+z.methodNameInCrud,T)}">
                                ${z.icon?o`<vaadin-icon icon="${z.icon}"></vaadin-icon>`:d}
                                ${z.label??d}
                            </vaadin-button>`)}else(de.dataType==="actionGroup"||de.dataType==="menu")&&(D?.actions??[]).forEach(k=>J.push(o`
                            <vaadin-button theme="tertiary small" title="${k.label||d}"
                                @click="${U=>Ve(U,"action-on-row-"+k.methodNameInCrud,T)}">
                                ${k.icon?o`<vaadin-icon icon="${k.icon}"></vaadin-icon>`:d}
                                ${k.label??d}
                            </vaadin-button>`))}return J.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${J}
                    </div>`:d};return o`
                <vaadin-list-box style="width: 100%;">
                    ${m.length===0?o`<vaadin-item disabled>${lt(w)}</vaadin-item>`:d}
                    ${m.map(T=>o`
                        <vaadin-item
                            ?selected="${$&&R!==void 0&&String(T[$])===String(R)}"
                            @click="${()=>{$&&T[$]!==void 0&&(this.state={...this.state,_selectedId:String(T[$])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:T},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${S?T[S.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${st.map(J=>o`<span>${J.label}: ${y(J,T)}</span>`)}
                            </div>
                            ${yt(T)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},I=($,R,S)=>{const j=this.identifierFieldName;j&&S[j]!==void 0&&(this.state={...this.state,_selectedId:String(S[j])}),$.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:R,parameters:S},bubbles:!0,composed:!0}))},B=()=>{const $=this.identifierFieldName,R=this.state._selectedId??this.appState?._splitDetailId,S=p.slice(0,6),j=S.filter(k=>k.stereotype==="image"),st=S.find(k=>k.identifier)??S[0],$t=k=>!!k.actionId,Ve=k=>k.dataType==="action"||k.dataType==="actionGroup"||k.dataType==="menu"||k.stereotype==="button",yt=S.find(k=>k.id==="select"&&k.dataType==="action"),T=!!yt,J=S.filter(k=>k!==st&&!j.includes(k)&&!$t(k)&&!Ve(k)),de=S.filter(k=>Ve(k)&&!(T&&k===yt)),D=(k,U,He)=>{k.stopPropagation(),k.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:U,parameters:{_clickedRow:He}},bubbles:!0,composed:!0}))},z=k=>{const U=[];for(const He of de){const ya=k[He.id];if(He.dataType==="action"){const xt=ya?.methodNameInCrud?ya:k.action?.methodNameInCrud?k.action:{methodNameInCrud:He.id,label:He.label,icon:null};U.push(o`
                            <vaadin-button theme="tertiary" title="${xt.label||d}"
                                @click="${rt=>D(rt,"action-on-row-"+xt.methodNameInCrud,k)}">
                                ${xt.icon?o`<vaadin-icon icon="${xt.icon}"></vaadin-icon>`:d}
                                ${xt.label??d}
                            </vaadin-button>`)}else(He.dataType==="actionGroup"||He.dataType==="menu")&&(ya?.actions??[]).forEach(rt=>U.push(o`
                            <vaadin-button theme="tertiary" title="${rt.label||d}"
                                @click="${Ui=>D(Ui,"action-on-row-"+rt.methodNameInCrud,k)}">
                                ${rt.icon?o`<vaadin-icon icon="${rt.icon}"></vaadin-icon>`:d}
                                ${rt.label??d}
                            </vaadin-button>`))}return U.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${U}
                    </div>`:d};return o`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${m.length===0?o`<div style="grid-column: 1 / -1;">${lt(w)}</div>`:d}
                    ${m.map(k=>o`
                        <vaadin-card
                            clickable
                            ?data-selected="${$&&R!==void 0&&String(k[$])===String(R)}"
                            style="cursor: pointer;"
                            @click="${U=>T?D(U,"action-on-row-select",k):I(U.target,"view",k)}"
                        >
                            ${j.length?o`<img slot="media" src="${k[j[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:d}
                            ${st?o`<div slot="title">${k[st.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${J.map(U=>o`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${U.label}</span>
                                        <span>${y(U,k)}</span>
                                    </div>
                                `)}
                            </div>
                            ${z(k)}
                        </vaadin-card>
                    `)}
                </div>`},_e=()=>{const $=f.find(S=>S.identifier)??f[0],R=f.filter(S=>S!==$);return o`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${m.length===0?o`<vaadin-item disabled>${lt(w)}</vaadin-item>`:d}
                            ${m.map(S=>o`
                                <vaadin-item
                                    ?selected="${this.selectedItem===S}"
                                    @click="${()=>{this.selectedItem=S}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${$?S[$.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${R.map(j=>o`${y(j,S)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?o`
                            <vaadin-form-layout>
                                ${p.map(S=>o`
                                    <vaadin-text-field
                                        label="${S.label}"
                                        .value="${String(this.selectedItem[S.id]??"")}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        `:o`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},Z=()=>{const $=this.identifierFieldName,R=this.state._selectedId??this.appState?._splitDetailId,S=p[0],j=p.slice(1),st=!!S?.actionId,$t=D=>(D??[]).map(z=>{const k=Array.isArray(z.children)?z.children:[];return k.length>0?{...z,children:$t(k)}:{...z,children:void 0}}),Ve=$t(m),yt=(D,z)=>{const k=D.parentItem?D.parentItem.children??[]:Ve;z(k,k.length)},T=(D,z)=>{for(const k of D??[]){if($&&String(k[$])===z)return k;const U=T(k.children,z);if(U)return U}},J=$&&R!==void 0?T(Ve,String(R)):void 0,de=(D,z,k)=>{D.stopPropagation(),$&&z[$]!==void 0&&(this.state={...this.state,_selectedId:String(z[$])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:k,parameters:z},bubbles:!0,composed:!0}))};return o`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${$??"id"}"
                    .dataProvider="${yt}"
                    .selectedItems="${J?[J]:[]}"
                >
                    ${S?o`<vaadin-grid-tree-column path="${S.id}" header="${S.label??d}" flex-grow="1"></vaadin-grid-tree-column>`:d}
                    ${st?o`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${qe(D=>D?.viewable===!1?d:o`
                        <vaadin-button theme="tertiary small" @click="${z=>de(z,D,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:d}
                    ${j.map(D=>D.id==="select"?o`<vaadin-grid-column width="7rem" flex-grow="0" text-align="end" header="${D.label??d}" ${qe(z=>o`
                            <vaadin-button theme="tertiary small" @click="${k=>{k.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:z}},bubbles:!0,composed:!0}))}}">Select</vaadin-button>
                        `,[])}></vaadin-grid-column>`:o`<vaadin-grid-column path="${D.id}" header="${D.label??d}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${lt(w)}</span>
                </vaadin-grid>`},le=M.get()?.rendersCrudLayouts?.()===!0,G=o`
            ${i.infiniteScrolling?o`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!le&&h==="list"?g():!le&&h==="cards"?i.contentHeight?o`
                <vaadin-scroller style="width: 100%; height: ${i.contentHeight};">
                    ${B()}
                </vaadin-scroller>
            `:B():!le&&h==="masterDetail"?_e():!le&&h==="tree"?Z():M.get()?.renderTableComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,ee=i.infiniteScrolling?d:M.get()?.renderPagination(this,this.component),K=o`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${$=>{this.showImportDialog=$.detail.value}}"
                ${ca(()=>o`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${Ta(()=>o`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?o`
                ${K}
                <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--lumo-space-m); display: flex; flex-direction: column;">
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
                    <div style="flex-shrink: 0;">${M.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${G}</div>
                    <div style="flex-shrink: 0;">${ee}</div>
                </div>
            `:o`
            ${K}
            ${c?o`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${i?.title?o`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(i.title)}</h2>
                            `:d}
                            ${i?.subtitle?o`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(i.subtitle)}</span>
                            `:d}
                        </div>
                        ${r.map($=>a($))}
                        ${l?o`<span class="toolbar-divider"></span>`:d}
                        ${n.map($=>a($))}
                        <slot></slot>
                    </div>
                `:d}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0;">${M.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${G}</div>
                <div style="flex-shrink: 0;">${ee}</div>
            </div>
        `}createRenderRoot(){return M.mustUseShadowRoot()?super.createRenderRoot():this}};oe.styles=C`
        ${Be}
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
    `;Ee([u()],oe.prototype,"component",2);Ee([u()],oe.prototype,"baseUrl",2);Ee([u({type:Boolean})],oe.prototype,"standalone",2);Ee([u()],oe.prototype,"state",2);Ee([u()],oe.prototype,"data",2);Ee([u()],oe.prototype,"appState",2);Ee([u()],oe.prototype,"appData",2);Ee([b()],oe.prototype,"showImportDialog",2);Ee([b()],oe.prototype,"availableWidthPx",2);Ee([b()],oe.prototype,"selectedItem",2);oe=Ee([E("mateu-table-crud")],oe);var Xe=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(Xe||{}),Dn=Object.defineProperty,fa=(e,t,a,i)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,a,s)||s);return s&&Dn(t,a,s),s};class it extends pa{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==Xe.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const s=a;s.triggered=!0;var i=s.times-1;s.timeoutMillis>0?this.scheduleOnload(s,i,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,i)=>{if(i!=this.component?.id)return;const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:s},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,s=(this.component.triggers??[]).filter(r=>r.type==Xe.OnCustomEvent).filter(r=>r.eventName==a.type).filter(r=>r.source!=="COMPONENT"||a.detail?.__source===r.from);s.length!==0&&(s.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),s.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return vi(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return gs(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(qt.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=ce(),t.component?.type==ie.ServerSide)if(this.component){const i=this.component,s=t.component;i.actions=s.actions,i.type=s.type,i.rules=s.rules,i.triggers=s.triggers,i.serverSideType=s.serverSideType,i.route=s.route,i.initialData=s.initialData,i.validations=s.validations,i.cssClasses=s.cssClasses,i.slot=s.slot,i.style=s.style,i.children=s.children,(i.serverSideType!=s.serverSideType||i.id!=s.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const i=[t.component];this.component&&(this.component.children=i)}t.action!==qt.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const i in t.data){const s=t.data[i]?.page;s?.pageNumber>0&&this.data[i]&&this.data[i].page.content&&(s.content?s.content=[...this.data[i].page.content,...s.content]:s.content=[...this.data[i].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const a=M.getAfterRenderHook();a&&setTimeout(()=>a(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:i})=>a.removeEventListener(i,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==Xe.OnCustomEvent).forEach(a=>{const i=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;i.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:i,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}fa([u()],it.prototype,"state");fa([u()],it.prototype,"data");fa([u()],it.prototype,"appData");fa([u()],it.prototype,"appState");var Ln=Object.defineProperty,An=Object.getOwnPropertyDescriptor,ba=(e,t,a,i)=>{for(var s=i>1?void 0:i?An(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ln(t,a,s),s};let Et=class extends _{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>o`
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
                ${hi(this.notificationRenderer,[])}
        ></vaadin-notification>`}};Et.styles=C`
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
  `;ba([b()],Et.prototype,"loading",2);ba([b()],Et.prototype,"notificationOpened",2);ba([b()],Et.prototype,"error",2);Et=ba([E("mateu-api-caller")],Et);class Fn{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Ft=new Fn;var Nn=Object.defineProperty,qn=Object.getOwnPropertyDescriptor,q=(e,t,a,i)=>{for(var s=i>1?void 0:i?qn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Nn(t,a,s),s};let A=class extends it{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(a.selected)return a;const i=this.getSelectedOption(a.submenus);if(i)return i}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const i of e)if(!i.separator)if(i.submenus&&i.submenus.length>0){const s=t?`${t} › ${i.label}`:i.label;a.push(...this.flattenMenuForPalette(i.submenus,s))}else a.push({label:i.label,breadcrumb:t,consumedRoute:i.consumedRoute,route:i.route,actionId:i.actionId,baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,Math.min(t.length,10)-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.commandPaletteSelectedIndex];a&&(this.selectRoute(a.consumedRoute,a.route,a.actionId,a.baseUrl,a.serverSideType,a.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),i=a?t.filter(s=>s.label.toLowerCase().includes(a)||s.breadcrumb.toLowerCase().includes(a)):t;return o`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${s=>s.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        <vaadin-icon icon="vaadin:search" class="cmd-search-icon"></vaadin-icon>
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${s=>{this.commandPaletteQuery=s.target.value,this.commandPaletteSelectedIndex=0}}
                            @keydown=${s=>this.handleCommandPaletteKeydown(s,i)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${i.slice(0,10).map((s,r)=>o`
                            <div class="cmd-result ${r===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(s.consumedRoute,s.route,s.actionId,s.baseUrl,s.serverSideType,s.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=r}}
                            >
                                <span class="cmd-result-label">${s.label}</span>
                                ${s.breadcrumb?o`<span class="cmd-result-breadcrumb">${s.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${i.length===0?o`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
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
                            ${t.icon?o`<vaadin-icon icon="${t.icon}" style="font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"></vaadin-icon>`:d}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?o`<div class="nav-tile-desc">${t.description}</div>`:d}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,a,i,s,r)=>{Ft.confirmLeave()&&this._selectRoute(e,t,a,i,s,r)},this._selectRoute=(e,t,a,i,s,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=i,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=r,this.instant=ce(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let h=c;this.selectedUriPrefix&&(h.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?h=this.selectedUriPrefix+h.substring(1):!h.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?h=this.selectedUriPrefix+"/"+h:h=this.selectedUriPrefix+h),h=="/_page"&&(h=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:h},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let i=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(i=this.mapItems(a.submenus,"")),i&&i.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected,children:i}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?o`
                <vaadin-details summary="${e.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${e.submenus.map(t=>o`${this.renderOptionOnLeftMenu(t)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`:o`<vaadin-button theme="tertiary" 
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</vaadin-button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",ce())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?o`
            ${e.map(a=>{const i=a;return o`

                        ${i.component=="hr"?o`<hr slot="children"/>`:o`
                                <vaadin-side-nav-item
                                .path="${i.route&&!i.children?i.route:void 0}"
                                .pathAliases="${[this.baseUrl+(i.route?i.route:"")]}"
                                slot="${t}"
                                ?expanded="${i.selected}"
                                >
                                    ${i.icon?o`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:d}
                                    ${i.text}
                                    ${this.renderSideNav(i.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return M.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{(e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="")},document.addEventListener("keydown",this._commandPaletteHandler),Ft.install(),this.addEventListener("compact-changed",this._compactHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler)}updated(e){if(super.updated(e),this.component){const a=this.component.metadata;if(a){const i=a;if(i.favicon){let s=document.querySelector("link[rel~='icon']");s||(s=document.createElement("link"),s.rel="icon",document.head.appendChild(s)),s.href=i.favicon}e.has("component")&&(this.selectedRoute=i.homeRoute,this.selectedConsumedRoute=i.homeConsumedRoute,this.selectedServerSideType=i.homeServerSideType,this.selectedBaseUrl=i.homeBaseUrl,this.selectedUriPrefix=i.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return M.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};A.styles=C`

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

  `;q([b()],A.prototype,"filter",2);q([b()],A.prototype,"instant",2);q([b()],A.prototype,"selectedConsumedRoute",2);q([b()],A.prototype,"selectedRoute",2);q([b()],A.prototype,"selectedUriPrefix",2);q([b()],A.prototype,"selectedBaseUrl",2);q([b()],A.prototype,"selectedServerSideType",2);q([b()],A.prototype,"selectedParams",2);q([b()],A.prototype,"tilesMenuOption",2);q([b()],A.prototype,"railOpenOption",2);q([b()],A.prototype,"commandPaletteOpen",2);q([b()],A.prototype,"commandPaletteQuery",2);q([b()],A.prototype,"commandPaletteSelectedIndex",2);q([b()],A.prototype,"pageCompact",2);q([ke("mateu-chat")],A.prototype,"chat",2);q([b()],A.prototype,"isDark",2);q([b()],A.prototype,"chatOpen",2);q([ke("vaadin-app-layout")],A.prototype,"vaadinAppLayout",2);A=q([E("mateu-app")],A);var Un=Object.defineProperty,Mn=Object.getOwnPropertyDescriptor,ze=(e,t,a,i)=>{for(var s=i>1?void 0:i?Mn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Un(t,a,s),s};let ue=class extends _{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const r=a.keyCode||a.which;(r===32||r===13)&&t.click()})}}render(){return o`
       `}};ue.styles=C`
  `;ze([u()],ue.prototype,"message",2);ze([u()],ue.prototype,"dismiss",2);ze([u()],ue.prototype,"learnMore",2);ze([u()],ue.prototype,"learnMoreLink",2);ze([u()],ue.prototype,"showLearnMore",2);ze([u()],ue.prototype,"position",2);ze([u()],ue.prototype,"cookieName",2);ze([b()],ue.prototype,"_css",2);ze([ke('[aria-label="cookieconsent"]')],ue.prototype,"popup",2);ue=ze([E("mateu-cookie-consent")],ue);var Bn=Object.defineProperty,jn=Object.getOwnPropertyDescriptor,Li=(e,t,a,i)=>{for(var s=i>1?void 0:i?jn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Bn(t,a,s),s};let na=class extends _{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return o`<slot></slot>`}};na.styles=C`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;Li([u()],na.prototype,"target",2);na=Li([E("mateu-event-interceptor")],na);var Wn=Object.defineProperty,Vn=Object.getOwnPropertyDescriptor,Ai=(e,t,a,i)=>{for(var s=i>1?void 0:i?Vn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Wn(t,a,s),s};let la=class extends it{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const a=Pa(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
        <vaadin-dialog
                header-title="${a}"
                .opened="${this.opened}"
                slot="${this.component?.slot??d}"
                theme="${t}"
                ?modeless="${e.modeless}"
                ?draggable="${e.draggable}"
                ?resizable="${e.resizable}"
                top="${e.top??d}"
                left="${e.left??d}"
                right="${e.right??d}"
                width="${e.width??d}"
                height="${e.height??d}"
                ${e.header||e.closeButtonOnHeader?es(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?x(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}${e.closeButtonOnHeader?o`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:d}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.footer?Ta(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${x(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.content?ca(()=>o`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${x(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};la.styles=C`
  `;Ai([b()],la.prototype,"opened",2);la=Ai([E("mateu-dialog")],la);var Hn=Object.defineProperty,Gn=Object.getOwnPropertyDescriptor,Fi=(e,t,a,i)=>{for(var s=i>1?void 0:i?Gn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Hn(t,a,s),s};let da=class extends it{constructor(){super(...arguments),this.opened=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=Pa(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
        ${e.modeless?d:o`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${a??d}"
                style="${e.width?`width: ${e.width};`:""}${this.component?.style??""}"
        >
            <header>
                ${a?o`<h3>${a}</h3>`:o`<span class="spacer"></span>`}
                ${e.header?o`
                    <mateu-event-interceptor .target="${this}">${x(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?o`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${x(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
            </div>
            ${e.footer?o`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${x(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:d}
        </section>
       `}};da.styles=C`
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
        header {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, 0.5rem);
            padding: var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem);
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
        header h3 {
            flex: 1;
            margin: 0;
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
        }
        header .spacer {
            flex: 1;
        }
        .content {
            flex: 1;
            overflow: auto;
            padding: var(--lumo-space-m, 1rem);
        }
        .content.no-padding {
            padding: 0;
        }
        footer {
            padding: var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem);
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
  `;Fi([b()],da.prototype,"opened",2);da=Fi([E("mateu-drawer")],da);var Kn=Object.defineProperty,Jn=Object.getOwnPropertyDescriptor,Q=(e,t,a,i)=>{for(var s=i>1?void 0:i?Jn(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Kn(t,a,s),s};function ai(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let V=class extends _{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],i=t.append??!1;i?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const s=i?this.actionBanners.length-a.length:0;a.forEach((r,n)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const l=s+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,h)=>h!==l)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let i=a?a.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const l=n.getBoundingClientRect();l.top<=i+t+2&&(i=Math.max(i,l.bottom))}const s=i+t+4;let r=0;this._tocEntries.forEach((n,l)=>{n.el.getBoundingClientRect().top<=s&&(r=l)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,i)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,i])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return $e(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),i=this._evalBannerText(e.description);return o`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${a||e.hasCloseButton?o`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${a??""}</span>
                        ${e.hasCloseButton?o`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:d}
                    </div>
                `:d}
                ${i?o`<p>${i}</p>`:d}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),a=this.component?.metadata?.toc,i=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),s=(a===!0?!0:a===!1?!1:i)&&t.length>0;this._tocEntries=t,this._tocVisible=s,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),s?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let a=this._headerH+t;for(const i of this._sectionCards())i.classList.contains("mateu-section--sticky")&&(i.style.top=a+"px",a+=i.offsetHeight+t)}_scrollContainer(){let e=ai(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=ai(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let i=this._headerH+a;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(i+=l.offsetHeight+a)}const s=this._scrollContainer(),r=s?s.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-r-i;(s??window).scrollBy({top:n,behavior:"smooth"})}render(){const e=this.component?.metadata,i=[...(e?.banners??[]).map((r,n)=>({banner:r,index:n})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:n})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((r,n)=>({banner:r,onDismiss:()=>this._dismissActionBanner(n)}))],s=o`
            <mateu-content-header
                class="${this._tocVisible?"sticky-header":""}"
                .metadata="${e}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${i.length>0?o`
                <div class="page-banners">
                    ${i.map(({banner:r,onDismiss:n})=>this._renderBanner(r,n))}
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
                            ${this._tocEntries.map((r,n)=>o`
                                <a class="page-toc__item ${n===this._activeToc?"is-active":""}"
                                   @click=${()=>this._scrollToSection(n)}
                                   title=${n<9?`${r.title} (Ctrl+Alt+${n+1})`:r.title}>
                                    <span class="page-toc__label">${r.title}</span>
                                    ${n<9?o`<span class="page-toc__key">${n+1}</span>`:d}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:d}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(r=>x(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return o`<div style="display: flex; flex-direction: column; width: 100%;">${s}</div>`}};V.styles=C`
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
    `;Q([u()],V.prototype,"component",2);Q([u()],V.prototype,"baseUrl",2);Q([u()],V.prototype,"state",2);Q([u()],V.prototype,"data",2);Q([u()],V.prototype,"appState",2);Q([u()],V.prototype,"appData",2);Q([u()],V.prototype,"value",2);Q([u({type:Boolean})],V.prototype,"standalone",2);Q([b()],V.prototype,"actionBanners",2);Q([b()],V.prototype,"dismissedStaticBannerIndices",2);Q([b()],V.prototype,"_tocEntries",2);Q([b()],V.prototype,"_activeToc",2);Q([b()],V.prototype,"_tocVisible",2);V=Q([E("mateu-page")],V);const ga=C`
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
`,Ot=e=>N`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Ua=Ot(N`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Ma=Ot(N`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Ba=Ot(N`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),Yn=Ot(N`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),Xn=Ot(N`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Qn=Ot(N`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var Zn=Object.defineProperty,el=Object.getOwnPropertyDescriptor,F=(e,t,a,i)=>{for(var s=i>1?void 0:i?el(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Zn(t,a,s),s};const ii=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],tl=e=>ii[Math.abs(e??0)%ii.length],al=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let L=class extends _{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=ce(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),a=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=a.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,a=Array.from(t.files??[]);if(t.value="",!(!a.length||!this.uploadUrl)){this.uploading=!0;try{const i=new FormData;i.append("sessionId",this.chatSessionId);for(const p of a)i.append("files",p,p.name);const s={},r=localStorage.getItem("__mateu_auth_token");r&&(s.Authorization="Bearer "+r);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(s["X-Session-Id"]=n);const l=await fetch(this.uploadUrl,{method:"POST",headers:s,body:i});if(!l.ok)throw new Error(`Upload failed: ${l.status}`);const h=((await l.json()).files??[]).filter(p=>p&&p.path);this.attachments=[...this.attachments,...h]}catch(i){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${i instanceof Error?i.message:i}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),a=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,i=this.attachments;if(!t&&i.length===0||!a)return;const s=i.length?`${t}${t?`

`:""}📎 ${i.map(l=>l.name).join(", ")}`:t;this.addMessage(s,"user"),this.attachments=[];const r=this.addMessage("","agent");this.startLoading();let n="";try{const l={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(l.Authorization="Bearer "+c);const h=sessionStorage.getItem("__mateu_sesion_id");h&&(l["X-Session-Id"]=h);const p=this.contextProvider?.(),f=JSON.stringify({message:t,sessionId:this.chatSessionId,...i.length&&{attachments:i},...p!=null&&{context:p},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const m=await fetch(a,{method:"POST",headers:l,body:f});if(!m.ok){const I=await m.text();throw new Error(`Servidor respondió ${m.status}: ${I}`)}const w=m.body?.getReader();if(!w)throw new Error("No se pudo obtener el reader del stream.");const y=new TextDecoder;let g="";for(;;){const{done:I,value:B}=await w.read();if(I){if(g.trim().startsWith("data:")){const G=g.trim().slice(5).trim(),ee=this.tryParseTokenUsage(G),K=!ee&&this.tryParseCustomEvent(G);ee?this.tokenUsage={...this.tokenUsage,...ee}:K?K.event==="agent-error"?(n="⚠️ "+(K.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent(K.event,{detail:K.detail,bubbles:!0,composed:!0})):(n+=G,this.updateMessage(r,n))}break}const _e=y.decode(B,{stream:!0});g+=_e;const Z=g.split(`
`);g=Z.pop()||"";let le=!1;for(const G of Z)if(G.trim().startsWith("data:")){const ee=G.trim().slice(5).trim(),K=this.tryParseTokenUsage(ee),$=!K&&this.tryParseCustomEvent(ee);K?this.tokenUsage={...this.tokenUsage,...K}:$?$.event==="agent-error"?(n="⚠️ "+($.detail?.message??"Error desconocido del agente"),this.updateMessage(r,n)):this.dispatchEvent(new CustomEvent($.event,{detail:$.detail,bubbles:!0,composed:!0})):(n+=ee+`
`,le=!0)}le&&this.updateMessage(r,n)}n||this.updateMessage(r,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(l){console.error("Error en el flujo SSE:",l);const c=l?.message??String(l);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(r,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(r,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,i)=>i===e?{...a,text:t}:a),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if(typeof a.event=="string")return{event:a.event,detail:a.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return a}catch{}return null}buildMenuContext(e,t=[]){const a=[];for(const i of e){if(i.separator||i.remote)continue;const s=[...t,i.label];if(i.submenus&&i.submenus.length>0)a.push(...this.buildMenuContext(i.submenus,s));else{const r={path:s,navigation:{route:i.route,consumedRoute:i.consumedRoute,actionId:i.actionId??"",baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix}};i.description&&(r.description=i.description),a.push(r)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return o`
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
                        ${Qn}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>o`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${tl(e.userColorIndex)};">${al(e.userName)}</div>
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
                    >${Xn}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};L.styles=[ga,C`
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
    `];F([u({attribute:!1})],L.prototype,"contextProvider",2);F([u()],L.prototype,"localAgentUrl",2);F([u({attribute:!1})],L.prototype,"mcpUrl",2);F([b()],L.prototype,"localAgentAlive",2);F([u()],L.prototype,"sseUrl",2);F([u()],L.prototype,"uploadUrl",2);F([u({attribute:!1})],L.prototype,"menu",2);F([b()],L.prototype,"attachments",2);F([b()],L.prototype,"uploading",2);F([ke(".file-input")],L.prototype,"fileInputElement",2);F([u({type:Boolean,reflect:!0})],L.prototype,"expanded",2);F([u()],L.prototype,"items",2);F([ke(".scroll-container")],L.prototype,"scrollContainer",2);F([ke(".msg-input")],L.prototype,"messageInputElement",2);F([b()],L.prototype,"recognition",2);F([b()],L.prototype,"listening",2);F([b()],L.prototype,"recognitionAvailable",2);F([b()],L.prototype,"loading",2);F([b()],L.prototype,"elapsedSeconds",2);F([b()],L.prototype,"tokenUsage",2);L=F([E("mateu-chat")],L);var il=Object.defineProperty,sl=Object.getOwnPropertyDescriptor,Jt=(e,t,a,i)=>{for(var s=i>1?void 0:i?sl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&il(t,a,s),s};let mt=class extends _{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([ae(()=>import("./vendor-chartjs.js").then(i=>i.a),[]),ae(()=>import("./vendor-chartjs.js").then(i=>i.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return o`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};mt.styles=C`
  `;Jt([u()],mt.prototype,"type",2);Jt([u()],mt.prototype,"data",2);Jt([u()],mt.prototype,"options",2);Jt([ke("#chart")],mt.prototype,"chartElement",2);mt=Jt([E("mateu-chart")],mt);var rl=Object.defineProperty,ol=Object.getOwnPropertyDescriptor,ja=(e,t,a,i)=>{for(var s=i>1?void 0:i?ol(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&rl(t,a,s),s};let jt=class extends _{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await ae(async()=>{const{default:i}=await import("./vendor-diagrams.js").then(s=>s.i);return{default:i}},__vite__mapDeps([4,3,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return o`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};jt.styles=C`
  `;ja([u()],jt.prototype,"xml",2);ja([ke("#canvas")],jt.prototype,"divElement",2);jt=ja([E("mateu-bpmn")],jt);var nl=Object.defineProperty,ll=Object.getOwnPropertyDescriptor,Rt=(e,t,a,i)=>{for(var s=i>1?void 0:i?ll(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&nl(t,a,s),s};const Sa=160,Ie=56,dl=220,si=110,Ge=60,cl={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},hl={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},ul=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function pl(){return"step-"+Math.random().toString(36).slice(2,8)}let et=class extends _{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let a=!0;for(;a;)a=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const l=t[n.preconditionStepId]+1;l>t[n.id]&&(t[n.id]=l,a=!0)}});const i={};e.forEach(n=>{const l=t[n.id]??0;(i[l]??=[]).push(n.id)});const s={...this.positions};let r=!1;Object.entries(i).forEach(([n,l])=>{const c=Number(n);l.forEach((h,p)=>{s[h]||(s[h]={x:Ge+c*dl,y:Ge+p*si},r=!0)})}),r&&(this.positions=s)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=pl(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(s=>s.y),i=a.length?Math.max(...a)+si:Ge;this.positions={...this.positions,[e]:{x:Ge,y:i}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(i=>i.id!==e).map(i=>i.preconditionStepId===e?{...i,preconditionStepId:void 0}:i)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},i=this.toSvgPoint(e);this.dragOffset={x:i.x-a.x,y:i.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(i=>i.x))+Sa+Ge:600,a=e.length?Math.max(...e.map(i=>i.y))+Ie+Ge:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${i=>{i.target===i.currentTarget&&(this.selectedId=null)}}">
                            <defs>
                                <marker id="arrow" markerWidth="8" markerHeight="8"
                                        refX="6" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
                                </marker>
                            </defs>
                            ${a.map(i=>this.renderArrow(i))}
                            ${a.map(i=>this.renderNode(i))}
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
                    ${Ua}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Ma}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Ba}
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
        `}renderArrow(e){if(!e.preconditionStepId)return N``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return N``;const i=t.x+Sa,s=t.y+Ie/2,r=a.x,n=a.y+Ie/2,l=(i+r)/2;return N`
            <path d="M${i},${s} C${l},${s} ${l},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:Ge,y:Ge},a=cl[e.type]??"#64748b",i=hl[e.type]??"•",s=this.selectedId===e.id;return N`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Sa}" height="${Ie}" rx="8"
                      fill="white"
                      stroke="${s?a:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Ie}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Ie}" fill="${a}"/>
                <text x="16" y="${Ie/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${i}</text>
                <!-- name -->
                <text x="44" y="${Ie/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${Ie/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Ie/2+20}" font-size="9" fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(i=>i.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(i=>i.id!==e.id),a=(i,s)=>o`
            <div class="field">
                <label class="field-label">${i}</label>
                ${s}
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
                        @change="${i=>this.updateStep(e.id,{name:i.target.value})}"/>`)}
                    ${a("Type",o`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{type:i.target.value})}">
                            ${ul.map(i=>o`<option value="${i}" ?selected="${e.type===i}">${i}</option>`)}
                        </select>`)}
                    ${a("Description",o`<textarea class="inp" rows="2"
                        @change="${i=>this.updateStep(e.id,{description:i.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",o`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{preconditionStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>o`<option value="${i.id}" ?selected="${e.preconditionStepId===i.id}">${i.name} (${i.id})</option>`)}
                        </select>`)}
                    ${a("Precondition expression",o`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${i=>this.updateStep(e.id,{preconditionExpression:i.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${i=>this.updateStep(e.id,{parallel:i.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",o`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${i=>this.updateStep(e.id,{timeout:Number(i.target.value)})}"/>`)}
                    ${a("Retries",o`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${i=>this.updateStep(e.id,{retries:Number(i.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${i=>this.updateStep(e.id,{rollbackable:i.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",o`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{compensationStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>o`<option value="${i.id}" ?selected="${e.compensationStepId===i.id}">${i.name} (${i.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?a("Topic",o`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${i=>this.updateStep(e.id,{topic:i.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",o`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${i=>this.updateStep(e.id,{formId:i.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",o`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${i=>this.updateStep(e.id,{childWorkflowDefinitionId:i.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};et.styles=[ga,C`
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
    `];Rt([u()],et.prototype,"value",2);Rt([b()],et.prototype,"wf",2);Rt([b()],et.prototype,"positions",2);Rt([b()],et.prototype,"selectedId",2);Rt([b()],et.prototype,"showMeta",2);et=Rt([E("mateu-workflow")],et);var ml=Object.defineProperty,vl=Object.getOwnPropertyDescriptor,je=(e,t,a,i)=>{for(var s=i>1?void 0:i?vl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ml(t,a,s),s};const zt=160,fe=56,Ke=60,fl={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},bl={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},gl=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let Ca;const $l=()=>(Ca||(Ca=ae(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([4,3,1,2])).then(e=>new e.default)),Ca);function yl(){return"step-"+Math.random().toString(36).slice(2,8)}let ye=class extends _{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),a=new Set((this.wf.steps??[]).map(r=>r.id)),i=new Set((t.steps??[]).map(r=>r.id)),s=a.size!==i.size||[...i].some(r=>!a.has(r))||[...i].some(r=>{const n=(this.wf.steps??[]).find(c=>c.id===r),l=(t.steps??[]).find(c=>c.id===r);return n?.preconditionStepId!==l?.preconditionStepId});this.wf=t,(s||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(a=>({id:a.id,width:zt,height:fe})),edges:e.filter(a=>a.preconditionStepId).map(a=>({id:`${a.preconditionStepId}->${a.id}`,sources:[a.preconditionStepId],targets:[a.id]}))};try{const i=await(await $l()).layout(t),s={...this.positions};for(const r of i.children??[])(!this.elkPositioned.has(r.id)||!s[r.id])&&(s[r.id]={x:(r.x??0)+Ke,y:(r.y??0)+Ke},this.elkPositioned.add(r.id));this.positions=s,this.layoutReady=!0,this.layoutError=null}catch(a){this.layoutError=a?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const a=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),i=this.wf.steps.find(r=>r.id===e),s=t.preconditionStepId!==void 0&&t.preconditionStepId!==i?.preconditionStepId;this.wf={...this.wf,steps:a},s&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=yl(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.x);this.positions={...this.positions,[e]:{x:a.length?Math.max(...a)+zt+80:Ke,y:Ke}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(i=>i.id!==e).map(i=>i.preconditionStepId===e?{...i,preconditionStepId:void 0}:i)};const{[e]:t,...a}=this.positions;this.positions=a,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},i=this.toSvgPoint(e);this.dragOffset={x:i.x-a.x,y:i.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(i=>i.x))+zt+Ke:600,a=e.length?Math.max(...e.map(i=>i.y))+fe+Ke:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){if(!this.layoutReady)return o`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                ${this.layoutError?o`<div class="error">⚠ ${this.layoutError}</div>`:""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${i=>{i.target===i.currentTarget&&(this.selectedId=null)}}">
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
                            ${a.map(i=>this.renderArrow(i))}
                            ${a.map(i=>this.renderNode(i))}
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
                    ${Yn}
                    Re-layout
                </button>
                ${this.readOnly?d:o`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${Ua}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${Ma}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Ba}
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
        `}renderArrow(e){if(!e.preconditionStepId)return N``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return N``;const i=t.x+zt,s=t.y+fe/2,r=a.x,n=a.y+fe/2,l=(i+r)/2;return N`
            <path d="M${i},${s} C${l},${s} ${l},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:Ke,y:Ke},a=fl[e.type]??"#64748b",i=bl[e.type]??"•",s=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return N`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${n=>this.onNodeMouseDown(n,e.id)}"
               @click="${n=>{n.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${zt}" height="${fe}" rx="8"
                      fill="white"
                      stroke="${s?a:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${fe}" rx="8"
                      fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${fe}" fill="${a}"/>
                <text x="16" y="${fe/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${i}</text>
                <!-- labels -->
                <text x="44" y="${fe/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${fe/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${fe/2+20}" font-size="9"
                      fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),a=this.readOnly,i=(s,r)=>o`
            <div class="field">
                <label class="field-label">${s}</label>
                ${r}
            </div>
        `;return o`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    ${a?d:o`<button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>`}
                    <button class="close-btn"
                            @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${i("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${i("Name",o`<input class="inp" ?readonly="${a}" .value="${e.name}"
                        @change="${a?d:s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${i("Type",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${gl.map(s=>o`
                                <option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${i("Description",o`<textarea class="inp" rows="2" ?readonly="${a}"
                        @change="${a?d:s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${i("Precondition step",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`
                                <option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`)}
                    ${i("Precondition expression",o`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${a}"
                               .value="${e.preconditionExpression??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${a}"
                               @change="${a?d:s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${i("Timeout (ms)",o`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.timeout??0)}"
                               @change="${a?d:s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${i("Retries",o`
                        <input class="inp" type="number" min="0" ?readonly="${a}"
                               .value="${String(e.retries??0)}"
                               @change="${a?d:s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${a}"
                               @change="${a?d:s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?i("Compensation step",o`
                        <select class="inp" ?disabled="${a}"
                                @change="${a?d:s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`
                                <option value="${s.id}" ?selected="${e.compensationStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?i("Topic",o`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${a}"
                               .value="${e.topic??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?i("Form ID",o`
                        <input class="inp" ?readonly="${a}" .value="${e.formId??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?i("Child workflow ID",o`
                        <input class="inp" ?readonly="${a}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${a?d:s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};ye.styles=[ga,C`
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
    `];je([u()],ye.prototype,"value",2);je([u({type:Boolean})],ye.prototype,"readOnly",2);je([b()],ye.prototype,"wf",2);je([b()],ye.prototype,"positions",2);je([b()],ye.prototype,"layoutReady",2);je([b()],ye.prototype,"selectedId",2);je([b()],ye.prototype,"showMeta",2);je([b()],ye.prototype,"layoutError",2);ye=je([E("mateu-workflow-elk")],ye);var xl=Object.defineProperty,wl=Object.getOwnPropertyDescriptor,Yt=(e,t,a,i)=>{for(var s=i>1?void 0:i?wl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&xl(t,a,s),s};const kl=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],Sl=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],Cl={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function ri(){return"field-"+Math.random().toString(36).slice(2,8)}let vt=class extends _{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=ss.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:i}=t;if(a===void 0||i===void 0||a===i)return;const s=[...this.form.fields],[r]=s.splice(a,1);s.splice(i,0,r),this.form={...this.form,fields:s},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=ri(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const a={...t,id:ri(),label:t.label+" (copy)"},i=this.form.fields.findIndex(r=>r.id===e),s=[...this.form.fields];s.splice(i+1,0,a),this.form={...this.form,fields:s},this.selectedId=a.id,this.emit()}render(){return o`
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
                    ${Ua}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Ma}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Ba}
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
        `}renderRow(e){const t=Cl[e.dataType]??"#64748b",a=this.selectedId===e.id;return o`
            <div class="field-row ${a?"selected":""}"
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
                        @click="${i=>{i.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${i=>{i.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(a=>a.id===this.selectedId);if(!e)return d;const t=(a,i)=>o`
            <div class="prop-field">
                <label class="prop-label">${a}</label>
                ${i}
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
                            ${kl.map(a=>o`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",o`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${Sl.map(a=>o`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};vt.styles=[ga,C`
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
    `];Yt([u()],vt.prototype,"value",2);Yt([b()],vt.prototype,"form",2);Yt([b()],vt.prototype,"selectedId",2);Yt([b()],vt.prototype,"showMeta",2);vt=Yt([E("mateu-form-editor")],vt);var El=Object.defineProperty,_l=Object.getOwnPropertyDescriptor,De=(e,t,a,i)=>{for(var s=i>1?void 0:i?_l(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&El(t,a,s),s};let pe=class extends _{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return o`
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
        `}};pe.styles=C`
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
    `;De([u()],pe.prototype,"appState",2);De([u()],pe.prototype,"appData",2);De([b()],pe.prototype,"open",2);De([b()],pe.prototype,"activeTab",2);De([b()],pe.prototype,"hoveredTag",2);De([b()],pe.prototype,"hoveredId",2);De([b()],pe.prototype,"hoveredState",2);De([b()],pe.prototype,"hoveredData",2);De([b()],pe.prototype,"hoveredMeta",2);pe=De([E("mateu-debug-overlay")],pe);var be=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(be||{}),Ni=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Ni||{}),qi=(e=>(e.Continue="Continue",e.Stop="Stop",e))(qi||{}),Il=Object.defineProperty,Tl=Object.getOwnPropertyDescriptor,$a=(e,t,a,i)=>{for(var s=i>1?void 0:i?Tl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Il(t,a,s),s};let Dt=null,_t=class extends it{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,i=this.appState,s=this.appData,r=this.component,n=y=>vi(y,t,a,{appState:i,appData:s,component:r}),l=y=>mi(y,t,a,i,s,{component:r}),c=["state","data","appState","appData","component"],h=[t,a,i,s,r],p={...this.state},f={...this.data};let m=!1,w=!1;for(let y=0;y<e.length;y++){const g=e[y];try{if(n(g.filter)){if(be.SetStateValue==g.action||be.SetDataValue==g.action){const I=be.SetStateValue==g.action?p:f,B=g.fieldName.split(",");for(let _e=0;_e<B.length;_e++){const Z=B[_e];if(!I[Z]||I[Z]!=g.value){const le=g.expression?l(g.expression):g.value,G=Ni.none==g.fieldAttribute?Z:Z+"."+g.fieldAttribute;le!=I[G]&&(I[G]=le,be.SetStateValue==g.action&&(m=!0),be.SetDataValue==g.action&&(w=!0))}}}if(be.RunAction==g.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:g.actionId},bubbles:!0,composed:!0})),be.RunJS==g.action&&new Function(...c,g.value)(...h),be.SetAttributeValue==g.action){const I=g.expression?n(g.expression):g.value;if(g.fieldAttribute=="disabled"){I?this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(g.fieldName)?.removeAttribute(g.fieldAttribute);continue}this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,I)}if(be.SetCssClass==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.setAttribute("class",g.value),be.SetStyle==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.style.setProperty(g.expression,g.value),qi.Stop==g.result)break}}catch(I){console.error("rule failed",g,I)}}m&&(this.state=p),w&&(this.data=f),m&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let i=!0,s=!1;const r=this.data??{},n={...this.data??{},errors:{}};if(a){for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const h=(c.fieldId??"_component").split(",");for(let p=0;p<h.length;p++){const f=h[p];n.errors[f]=[]}}for(let l=0;l<a.length;l++){const c=a[l];if(!this.skipValidation(t,c))try{const h=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!h){i=!1;const f=(c.fieldId??"_component").split(",");for(let m=0;m<f.length;m++){const w=f[m];let y=n.errors[w];if(y||(n.errors[w]=[]),y=n.errors[w],!r[w]){let g=c.message;try{g=this._evalTemplate(c.message)}catch{}y.push(g)}}}}catch(h){console.error("validation failed",c,h)}}for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const h=(c.fieldId??"_component").split(",");for(let p=0;p<h.length;p++){const f=h[p];if(r.errors?[f].join(","):n.errors==""&&[f].join(",")){s=!0;break}}}(r.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(s=!0)}n._valid=i,n._valid!=r._valid&&(s=!0),s&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(i=>{a[i]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.state=a,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const i=this.component;i.triggers?.filter(s=>s.type==Xe.OnValueChange).filter(s=>!s.propertyName||t.fieldId==s.propertyName).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}),i.triggers?.filter(s=>s.type==Xe.AutoSave).forEach(s=>{const r=s.actionId,n=this._autoSaveTimers.get(r);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))},s.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const a=this.component,i=a.actions?.find(s=>s.id==t.actionId||s.id.endsWith("*")&&t.actionId.startsWith(s.id.replace("*","")));if(i){if(i&&i.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(i&&i.validationRequired){const r=Dt??this;if(Dt=null,r.checkValidations(i.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}Dt=null;const s={...t,initiatorComponentId:this.id};i&&i.confirmationRequired?this.callAfterConfirmation(i,()=>this.requestActionCallToServerOrBubble(s,a,i)):this.requestActionCallToServerOrBubble(s,a,i)}else{const s={...t.parameters};s.initiatorState||(s.initiatorState=this.state),Dt||(Dt=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:s},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const i of a){const s=i.metadata;if(s?.type===v.FormField){const r=s;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(i.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([s,r])=>{if(!Array.isArray(r))return;const n=s==="_component"?void 0:t[s]??s;r.forEach(l=>{l&&!a.some(c=>c.label===n&&c.msg===l)&&a.push({label:n,msg:l})})}),a.length===0){this.notify("There are validation errors");return}const i=document.createElement("vaadin-notification");i.position="bottom-end",i.setAttribute("theme","error"),i.duration=Math.max(3e3,1500+a.length*1e3),i.renderer=s=>{ui(o`
                <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs, .25rem);">
                    <strong>There are validation errors</strong>
                    ${a.map(({label:r,msg:n})=>r?o`<span>• <b>${r}:</b> ${n}</span>`:o`<span>• ${n}</span>`)}
                </div>
            `,s)},document.body.appendChild(i),i.opened=!0,i.addEventListener("opened-changed",s=>{s.detail.value||document.body.removeChild(i)})},this.notify=e=>{Wt.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let a="One moment, please",i="Are you sure?",s="Yes",r="No";e.confirmationTexts&&(a=e.confirmationTexts.title,i=e.confirmationTexts.message,s=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const n=document.createElement("vaadin-confirm-dialog");n.setAttribute("header",a),n.setAttribute("cancel-button-visible","cancel-button-visible"),n.setAttribute("confirm-text",s),n.setAttribute("cancel-text",r),n.append(i),n.opened=!0,n.addEventListener("confirm",()=>t()),n.addEventListener("close",()=>document.body.removeChild(n)),n.addEventListener("confirm",()=>document.body.removeChild(n)),n.addEventListener("cancel",()=>document.body.removeChild(n)),n.addEventListener("reject",()=>document.body.removeChild(n)),document.body.append(n)},this.requestActionCallToServerOrBubble=(e,t,a)=>{if(a&&a.bubble){const i={...e.parameters};i.initiatorState||(i.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:i},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a)},this.requestActionCallToServer=(e,t,a)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(i){console.error("when evaluating "+a.js,i,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),!(a&&(a.js||a.customEvent))){if(e.actionId=="search"){const i=e.parameters?._searchState;i?this.state={...this.state,...i}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:a?.background,sse:a?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(i=>i.type==Xe.OnSuccess).filter(i=>e.detail.actionId==i.calledActionId).forEach(i=>{if(!i.condition||this._evalExpr(i.condition))if(e.preventDefault(),e.stopPropagation(),i.timeoutMillis>0){const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,callbackToken:s},bubbles:!0,composed:!0}))},i.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(i=>i.type==Xe.OnError).filter(i=>e.detail.actionId==i.calledActionId).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const i=a.shortcut||(a.runOnEnter?"enter":null);if(i&&this._shortcutMatchesEvent(i,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return M.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return $s(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const i=a.shadowRoot;i&&t.push(...Array.from(i.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const i=a.dataset.shortcut;if(!i||!this._shortcutMatchesEvent(i,e))continue;const s=a.closest("vaadin-tabs");if(!s)continue;const r=Array.from(s.querySelectorAll("vaadin-tab")).indexOf(a);if(!(r<0))return e.preventDefault(),s.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return o`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?o`
                <div><ul>${this.data.errors._component.map(e=>o`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==ie.ClientSide){const e=this.component;return e.metadata?.type==v.Page?_a(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==v.Crud?Ia(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):M.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return o`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==ie.ClientSide){const t=e;if(t.metadata?.type==v.Page)return _a(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==v.Crud)return Ia(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return x(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};_t.styles=C`
        :host {
        }

        ${ts(Be.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;$a([u()],_t.prototype,"baseUrl",2);$a([u()],_t.prototype,"route",2);$a([u()],_t.prototype,"consumedRoute",2);_t=$a([E("mateu-component")],_t);const oi=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class Pl{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background)}}const Ol=new Pl;class Rl{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,i)=>{if(t?.fragments?.forEach(s=>{dt.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:i})}),t?.appState&&(W.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;Nt.value={...t.appData,...s},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(s=>{Wt.show(s.text,{position:s.position?this.mapPosition(s.position):void 0,theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{dt.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:i})})}}async runAction(t,a,i,s,r,n,l,c,h,p,f,m,w,y,g){try{const I=await Ol.handle(t,{baseUrl:a,route:i,consumedRoute:s,actionId:r,appState:W.value,initiatorComponentId:n,componentState:h,parameters:p,serverSideType:c,initiator:f,background:m});w&&w(I),y||this.handleUIIncrement(I,f,g),I.messages&&I.messages.length==1&&I.messages[0].variant=="error"&&f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:ce()},bubbles:!0,composed:!0}))}catch(I){console.warn("Action request failed",I),f.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(I)}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const zl=new Rl,Dl=zl;class Ll{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,a,i)=>{if(t?.messages?.forEach(s=>{Wt.show(s.text,{position:s.position?this.mapPosition(s.position):"bottom-end",theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{dt.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:i})}),t?.fragments?.forEach(s=>{dt.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:i})}),t?.appState&&(W.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;Nt.value={...t.appData,...s},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,i,s,r,n,l,c,h,p,f,m,w,y,g){if(i){i=i||"_no_route",i&&i.startsWith("/")&&(i=i.substring(1));const I={serverSideType:c,appState:W.value,componentState:h,parameters:p,initiatorComponentId:n,consumedRoute:s,route:"/"+i,actionId:r};m||f.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(a+"/mateu/v3/sse/"+i,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(I)}).then(async B=>{const _e=B.body?.pipeThrough(new TextDecoderStream).getReader();if(_e){let Z="";for(;;){const{value:le,done:G}=await _e.read();if(G)break;Z+=le;const ee=Z.split(`

`);Z=ee.pop()??"";for(const K of ee){const $=K.trim();if($)if($.startsWith("data:")){const R=JSON.parse($.substring(5).trim());w&&w(R),y||this.handleUIIncrement(R,f,g),R.messages&&R.messages.length==1&&R.messages[0].variant=="error"&&f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let R=$;try{const S=JSON.parse($);R=S.message,S._embedded?.errors?.length>0&&S._embedded.errors[0].message&&(R=S._embedded.errors[0].message)}catch{}throw new Error(R)}}}}m||f.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(B=>{f.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(B)}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Al=new Ll;var Fl=Object.defineProperty,Nl=Object.getOwnPropertyDescriptor,ve=(e,t,a,i)=>{for(var s=i>1?void 0:i?Nl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Fl(t,a,s),s};let X=class extends ua{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:ie.ClientSide,metadata:{type:v.Element,name:"div",content:"Not found"},id:"fieldId"},action:qt.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=Dl;t.sse&&(a=Al),a.runAction(za,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...W.value};if(this.overrides){const t=oi(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return M.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=oi(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||ce(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e}render(){return o`
           ${this.fragment?.component?x(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};X.styles=C`
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
  `;ve([u()],X.prototype,"consumedRoute",2);ve([u()],X.prototype,"serverSideType",2);ve([u()],X.prototype,"uriPrefix",2);ve([u()],X.prototype,"overrides",2);ve([u()],X.prototype,"homeRoute",2);ve([u()],X.prototype,"route",2);ve([u()],X.prototype,"top",2);ve([u()],X.prototype,"instant",2);ve([u()],X.prototype,"appState",2);ve([u()],X.prototype,"appData",2);ve([b()],X.prototype,"fragment",2);X=ve([E("mateu-ux")],X);var ql=Object.defineProperty,Ul=Object.getOwnPropertyDescriptor,We=(e,t,a,i)=>{for(var s=i>1?void 0:i?Ul(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&ql(t,a,s),s};let xe=class extends _{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let i=new URL(a+t);if((window.location.pathname||i.pathname)&&window.location.pathname!=i.pathname){let s=i.pathname;i.search&&(s+=i.search),s&&!s.startsWith("/")&&(s="/"+s),window.history.pushState({},"",s),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Ft.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",ce()))}}}createRenderRoot(){return M.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Ft.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Ft.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);W.value={...W.value,...e}}catch{W.value={...W.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=ce(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const i=JSON.parse(this.config);W.value={...W.value,...i}}catch{W.value={...W.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return o`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${Nt.value}"
                          .appState="${W.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?o`
               <mateu-debug-overlay
                   .appState="${W.value}"
                   .appData="${Nt.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};xe.styles=C`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;We([u()],xe.prototype,"baseUrl",2);We([u()],xe.prototype,"route",2);We([u()],xe.prototype,"consumedRoute",2);We([u()],xe.prototype,"config",2);We([u()],xe.prototype,"top",2);We([u()],xe.prototype,"pathPrefix",2);We([b()],xe.prototype,"instant",2);We([u({type:Boolean})],xe.prototype,"debug",2);xe=We([E("mateu-ui")],xe);var Ml=Object.defineProperty,Bl=Object.getOwnPropertyDescriptor,gt=(e,t,a,i)=>{for(var s=i>1?void 0:i?Bl(t,a):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(i?n(t,a,s):n(s))||s);return i&&s&&Ml(t,a,s),s};let we=class extends _{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),ws()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(Ra()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(i=>String(i.value)===e);if(t)return t.label;const a=$i()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){xs(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await za.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const a of t?.fragments??[]){const r=a.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(r)){this.searchedOptions=r.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),a=this.searchText!==""||t.length>we.SEARCHABLE_THRESHOLD;return o`
            <div class="panel">
                ${a?o`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${i=>{i.key==="Escape"&&this.closePanel()}}"/>`:d}
                <div class="options">
                    ${e?o`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:d}
                    ${t.map(i=>o`
                        <div class="option ${e===String(i.value)?"option--selected":""}"
                             @click="${()=>this.pick(i.value,i.label)}">${i.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?o`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():d}
            </label>`:o``}};we.SEARCHABLE_THRESHOLD=7;we.styles=C`
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
    `;gt([u()],we.prototype,"selector",2);gt([u()],we.prototype,"app",2);gt([u()],we.prototype,"baseUrl",2);gt([b()],we.prototype,"opened",2);gt([b()],we.prototype,"searchText",2);gt([b()],we.prototype,"searchedOptions",2);we=gt([E("mateu-app-context-picker")],we);const Lt=(e,t)=>{const a=e.contextSelectors??[];return a.length===0?d:o`${a.map(i=>o`
        <mateu-app-context-picker .selector="${i}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}`},Xt=(e,t)=>e.themeToggle?o`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:d,jl=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},ni=(e,t,a)=>{const i=Je(e,t,a),s=te(t,a);return i=="list"||i==s?"new":i},Je=(e,t,a)=>{const i=e?._route;if(i!=null&&(i===""||i.startsWith("/"))){const s=a.homeRoute??"",r=s.indexOf("?"),n=r>=0?s.substring(r+1):"",l=te(t,a)+i;if(!n)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+n}return t.selectedRoute?t.selectedRoute:a.homeRoute},te=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Le=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,Ae=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Fe=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Wl=(e,t,a,i,s,r,n)=>{const l=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=te(e,t),h=ni(i,e,t),p=h&&h!=="new"&&h.startsWith(c+"/")?h.substring(c.length+1).split("/")[0]:void 0;return o`
                    ${t.variant==Ne.MEDIATOR?o`

                        ${t.layout=="SPLIT"?o`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${te(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Le(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Ae(e,t)}"
                                            uriPrefix="${Fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...r,_splitDetailId:p}}"
                                            .appData="${n}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${ni(i,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${Le(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Ae(e,t)}"
                                            uriPrefix="${Fe(e,t)}"
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
                                        route="${Je(i,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Le(e,t)}"
                                        consumedRoute="${te(e,t)}"
                                        serverSideType="${Ae(e,t)}"
                                        uriPrefix="${Fe(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${n}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:d}
            ${t.variant==Ne.HAMBURGUER_MENU?o`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${Lt(t,e)}${Xt(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?o`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${f=>jl(f,e)}">
                                <vaadin-icon slot="suffix" icon="vaadin:search"></vaadin-icon>
                            </vaadin-text-field>
                            `:d}

                        <vaadin-side-nav .onNavigate="${e.navItemSelected}">
                            ${e.renderSideNav(l,void 0)}
                        </vaadin-side-nav>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Je(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Le(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Ae(e,t)}"
                                            uriPrefix="${Fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-app-layout>

            `:d}
            
            ${t.variant==Ne.MENU_ON_TOP?o`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${l}"
                                @item-selected="${e.itemSelected}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; min-width: 0; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Lt(t,e)}${Xt(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Je(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Le(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Ae(e,t)}"
                                            uriPrefix="${Fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-vertical-layout>

            `:d}

            ${t.variant==Ne.TILES?o`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
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
                            ${Lt(t,e)}${Xt(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):o`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Je(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Le(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Ae(e,t)}"
                                            uriPrefix="${Fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                        `}
                    </div>
                </vaadin-vertical-layout>
            `:d}

            ${t.variant==Ne.RAIL?o`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Je(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Le(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Ae(e,t)}"
                                            uriPrefix="${Fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            `:d}

            ${t.variant==Ne.MENU_ON_LEFT?o`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(f=>e.renderOptionOnLeftMenu(f))}
                            ${Lt(t,e)}${Xt(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Je(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Le(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Ae(e,t)}"
                                            uriPrefix="${Fe(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-horizontal-layout>


            `:d}

            ${t.variant==Ne.TABS?o`
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
                                ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                                ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                            </vaadin-horizontal-layout>
                            </a>
                            <vaadin-tabs selected="${e.getSelectedIndex(t.menu)}"
                                         style="box-shadow: unset; flex-grow: 1; min-width: 0;"
                                         class="${e.component?.cssClasses}">
                                ${t.menu.map(f=>o`
                                <vaadin-tab 
                                        @click="${()=>e.selectRoute(f.consumedRoute,f.route,f.actionId,f.baseUrl,f.serverSideType,f.uriPrefix)}"
                                >${f.label}</vaadin-tab>
                            `)}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${Lt(t,e)}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Je(i,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Le(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Ae(e,t)}"
                                            uriPrefix="${Fe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:r,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            
            `:d}

            ${t.fabs?.map((f,m)=>o`
                <button class="app-fab" style="bottom: ${t.sseUrl?5.5+m*4:1.5+m*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(f.actionId)}"
                    title="${f.label}">
                    <vaadin-icon icon="${f.icon}"></vaadin-icon>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?o`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            `:d}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},Vl=(e,t)=>t!=null&&e!=null&&!e.has(t),Hl=typeof HTMLElement<"u"?HTMLElement:class{};class Gl extends Hl{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",Gl);const li=new Set,Kl=(e,t,a)=>{const i=`${a}/${t}`;return li.has(i)||(li.add(i),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),o`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`};class Jl{renderFilterBar(t,a,i,s,r,n,l,c){const h=a?.metadata,p=m=>{const{fieldId:w,value:y}=m.detail;t.state={...t.state,[w]:y}},f=m=>{const{fieldIds:w}=m.detail,y={};w.forEach(g=>{y[g]=void 0}),y.searchText=void 0,t.state={...t.state,...y}};return o`
            <mateu-filter-bar
                .metadata="${h}"
                @search-requested="${t.search}"
                @value-changed="${p}"
                @filter-reset-requested="${f}"
                .state="${t.state}"
                .data="${r}"
                .appState="${n}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${h?.header?.map(m=>x(t,m,i,s,r,n,l))}
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
        `}renderTableComponent(t,a,i,s,r,n,l){return o`
        <mateu-table id="${t.id}"
                     .metadata="${a?.metadata}"
                     .data="${t.data}"
                     .state="${s}"
                     .appState="${n}"
                     .appData="${l}"
                     .emptyStateMessage="${s[a?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     baseUrl="${i}"
        ></mateu-table>
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,i,s,r,n,l,c){const h=a?.metadata?.type??a?.type,p=Object.values(v).includes(h)?h:void 0;return Vl(this.supportedClientSideTypes(),p)?Kl(a,p,this.rendererName()):qa(t,a,i,s,r,n,l,c)}renderAppComponent(t,a,i,s,r,n,l){return Wl(t,a?.metadata,i,s,r,n,l)}}class Yl extends Jl{rendererName(){return"vaadin"}renderClientSideComponent(t,a,i,s,r,n,l,c){return super.renderClientSideComponent(t,a,i,s,r,n,l,c)}}M.set(new Yl);
