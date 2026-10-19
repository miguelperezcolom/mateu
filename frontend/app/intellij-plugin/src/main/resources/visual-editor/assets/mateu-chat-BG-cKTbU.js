import{a as e,d as t,n,t as r}from"./lit-DSH4rRgP.js";import{$ as i,At as a,Bt as o,Ct as s,Ft as c,Gt as l,It as u,Kt as d,Lt as f,Mt as p,Ot as m,St as h,Wt as g,c as _,d as v,f as y,ht as b,jt as x,p as S,qt as C,rt as w,st as ee,u as te,vt as T,xt as E}from"./index-l1dkXJBD.js";import{a as D,r as O}from"./neutralChrome-DdLMX3HQ.js";function k(e){if(!e)return;let t=e.trim();if(t.startsWith(`/`)&&!t.startsWith(`//`))return t}function ne(e,t){if(!e||(t.button??0)!==0||t.ctrlKey||t.metaKey||t.shiftKey||t.altKey)return;let n=e.getAttribute(`target`);if(!(n&&n!==`_self`))return k(e.getAttribute(`href`))}function re(e,t){let n=t.split(/[?#]/)[0],r,i=-1,a=e=>{for(let t of e??[]){if(t.separator)continue;if(t.submenus?.length){a(t.submenus);continue}if(t.remote)continue;let e=(t.route??``).split(/[?#]/)[0];e&&e!==`/`&&(n===e||n.startsWith(e.endsWith(`/`)?e:e+`/`))&&e.length>i&&(r=t,i=e.length)}};if(a(e),r)return{route:t,consumedRoute:r.consumedRoute??``,actionId:``,baseUrl:r.baseUrl??``,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}}function A(e,t,n=new Set){if(e&&typeof e==`object`&&!n.has(e)){n.add(e),Array.isArray(e)||t(e);for(let r of Array.isArray(e)?e:Object.values(e))r&&typeof r==`object`&&A(r,t,n)}}var ie=e=>e&&e.metadata&&typeof e.metadata.type==`string`?e.metadata.type:void 0;function ae(e,t){if(!e||typeof e!=`object`)return{fields:[],actions:[]};let n=[],r=new Map,i;A(e,e=>{let t=ie(e);t===`FormField`&&e.metadata.fieldId?n.push(e.metadata):t===`Page`&&!i?i=e.metadata:t===`Button`&&e.metadata.actionId&&(r.has(e.metadata.actionId)||r.set(e.metadata.actionId,e.metadata.label))});let a=t&&typeof t==`object`?t:e.initialData&&typeof e.initialData==`object`?e.initialData:{},o=new Set,s=[];for(let e of n){if(o.has(e.fieldId))continue;o.add(e.fieldId);let t={id:e.fieldId,label:e.label??e.fieldId,dataType:e.dataType??`string`,stereotype:e.stereotype??`regular`,required:!!e.required,readOnly:!!e.readOnly};a&&Object.prototype.hasOwnProperty.call(a,e.fieldId)&&(t.value=a[e.fieldId]),Array.isArray(e.options)&&e.options.length&&(t.options=e.options.map(e=>e&&typeof e==`object`?{value:e.value,label:e.label??String(e.value??``)}:{value:e,label:String(e)})),s.push(t)}let c=[],l=new Set;for(let t of Array.isArray(e.actions)?e.actions:[]){if(!t||!t.id||l.has(t.id))continue;l.add(t.id);let e={id:t.id,label:r.get(t.id)??t.id};t.shortcut&&(e.shortcut=t.shortcut),c.push(e)}for(let[e,t]of r)l.has(e)||(l.add(e),c.push({id:e,label:t??e}));let u={fields:s,actions:c},d=i&&(i.pageTitle||i.title)||void 0;return d&&(u.title=d),e.route&&(u.route=e.route),e.serverSideType&&(u.serverSideType=e.serverSideType),(e.pageType||i&&i.pageType)&&(u.pageType=e.pageType||i.pageType),u}function oe(e){let t=[],n=e=>{let r=e.shadowRoot??e;(r.querySelectorAll?.(`mateu-component`))?.forEach(e=>{let r=e.component;r&&t.push(r),e.shadowRoot&&n(e)}),r.querySelectorAll?.(`*`).forEach(e=>{e.shadowRoot&&e.tagName!==`MATEU-COMPONENT`&&n(e)})};return n(e),t}function se(e=document,t){let n=null,r=-1;for(let i of oe(e)){let e=ae(i,t),a=e.fields.length+e.actions.length+ +!!e.title;a>r&&(n=e,r=a)}return n}var ce={title:`chat`,expand:`chatWiden`,restore:`chatRestoreWidth`,close:`closeChat`,resize:`chatResize`,empty:`chatEmpty`,placeholder:`chatPlaceholder`,send:`send`,dictate:`chatDictate`,stopDictation:`chatStopDictation`,thinking:`chatThinking`,answering:`chatAnswering`,callingTool:`chatCallingTool`,agentError:`chatAgentError`},j=(e,t)=>c(ce[e],t),M=class{constructor(){this.buffer=``,this.data=[],this.hasData=!1}push(e){this.buffer+=e;let t=[];for(;;){let e=/\r\n|\r|\n/.exec(this.buffer);if(!e||e[0]===`\r`&&e.index===this.buffer.length-1)break;let n=this.buffer.slice(0,e.index);this.buffer=this.buffer.slice(e.index+e[0].length),this.line(n,t)}return t}end(){let e=[];return this.buffer&&=(this.line(this.buffer.replace(/\r$/,``),e),``),this.dispatch(e),e}line(e,t){if(e===``){this.dispatch(t);return}if(e.startsWith(`:`))return;let n=e.indexOf(`:`);if((n<0?e:e.slice(0,n))!==`data`)return;let r=n<0?``:e.slice(n+1);r.startsWith(` `)&&(r=r.slice(1)),this.data.push(r),this.hasData=!0}dispatch(e){this.hasData&&e.push(this.data.join(`
`)),this.data=[],this.hasData=!1}},N=e=>typeof e==`number`&&Number.isFinite(e);function P(e){let t=e.trim();if(t.startsWith(`{`)){let e=null;try{let n=JSON.parse(t);n&&typeof n==`object`&&!Array.isArray(n)&&(e=n)}catch{}if(e){if(`inputTokens`in e||`outputTokens`in e||`totalTokens`in e)return{kind:`usage`,usage:e};if(typeof e.event==`string`){let t=e.detail??{};switch(e.event){case`agent-delta`:return{kind:`delta`,text:typeof t.text==`string`?t.text:``};case`agent-status`:return{kind:`status`,detail:t};case`agent-tool`:return{kind:`tool`,detail:t};case`agent-error`:return{kind:`error`,message:String(t.message??j(`agentError`))};default:return{kind:`event`,event:e.event,detail:e.detail??{}}}}}}return{kind:`text`,text:e}}function F(e){if(!e)return!0;let t=[e.inputTokens,e.outputTokens,e.totalTokens].filter(N);return t.length===0||t.every(e=>e===0)}var I=class{constructor(){this.text=``,this.streamed=!1}delta(e){return this.text+=e,this.streamed=!0,this.text}line(e){return this.streamed?(this.text=e,this.streamed=!1):this.text=this.text?this.text+`
`+e:e,this.text}error(e){return this.text=`⚠️ `+e,this.streamed=!1,this.text}},L=class{constructor(e){this.steps=[],this.answering=!1,this.reported=!1,this.since=e}status(e,t){this.reported=!0;let n=typeof e.text==`string`?e.text:void 0;(e.phase!==this.phase||n!==this.statusText||this.answering)&&(this.since=t),this.phase=e.phase,this.statusText=n,this.answering=!1}tool(e,t){this.reported=!0;let n=e.name??`herramienta`;if(e.phase===`start`){this.steps=[...this.steps,{name:n,server:e.server,kind:e.kind,running:!0}],this.since=t,this.answering=!1;return}let r=this.steps.slice(),i=r.length-1;for(;i>=0&&!(r[i].running&&r[i].name===n);)i--;let a={name:n,server:e.server,kind:e.kind,ms:e.ms,error:e.error,running:!1};i>=0?r[i]=a:r.push(a),this.steps=r,this.since=t}text(e){this.answering||(this.since=e),this.answering=!0}get runningTool(){for(let e=this.steps.length-1;e>=0;e--)if(this.steps[e].running)return this.steps[e]}line(e){let t=Math.max(0,Math.floor((e-this.since)/1e3)),n=e=>t>0?`${e} ${t} s`:e,r=this.runningTool;return r?n(j(`callingTool`).replace(`{name}`,r.name)):this.answering?j(`answering`):this.reported?n(this.statusText||j(`thinking`)):null}};function R(e){return N(e)?e<1e3?`${Math.round(e)} ms`:`${(e/1e3).toFixed(1).replace(`.`,`,`)} s`:``}var z=`Ctrl+Shift+M`,B=`Control+Shift+M`,V=e=>{if(!e||!e.ctrlKey||!e.shiftKey||e.altKey||e.metaKey||e.repeat)return!1;let t=typeof e.key==`string`?e.key:``;return/^[a-z]$/i.test(t)?t.toLowerCase()===`m`:e.code===`KeyM`},H=(e,t)=>`${j(e?`stopDictation`:`dictate`,t)} (${z})`,U={default:460,min:320,max:720},W=`mateu-chat-width`,G=e=>e==null||!Number.isFinite(e)?U.default:Math.round(Math.min(U.max,Math.max(U.min,e))),K=()=>{try{return typeof localStorage>`u`?void 0:localStorage}catch{return}},le=(e=K())=>{try{let t=e?.getItem(W);return t?G(Number(t)):U.default}catch{return U.default}},q=(e,t=K())=>{let n=G(e);try{t?.setItem(W,String(n))}catch{}return n},ue=(e,t,n,r=!1)=>G(e+(r?t-n:n-t)),J=`mateu-generated-screen`,Y=e=>e.parentNode instanceof ShadowRoot?e.parentNode.host:e.parentNode;function de(e){let t=null;for(let n=e;n;n=Y(n)){if(!(n instanceof HTMLElement))continue;let e=n.tagName.toLowerCase();if(e===`mateu-app`&&n.shadowRoot){let e=n.shadowRoot.querySelector(`mateu-ux[data-content-view]`);if(e)return e}e===`mateu-ux`&&(t=n)}return t??document.querySelector(`mateu-ux[data-content-view]`)??X(document,`mateu-ux[data-content-view]`)}function X(e,t){let n=e.querySelector(t);if(n)return n;for(let n of Array.from(e.querySelectorAll(`*`)))if(n.shadowRoot){let e=X(n.shadowRoot,t);if(e)return e}return null}function fe(e,t,n){let r=e.title??c(`chatGeneratedScreen`),i=e.target===`dialog`?{type:x.Dialog,id:J,headerTitle:r,content:t,closeButtonOnHeader:!0,width:`min(64rem, 92vw)`,initialData:n??{}}:{type:x.Drawer,id:J,headerTitle:r,content:t,position:`end`,size:`l`,maximizable:!0,initialData:n??{}};return{type:p.ClientSide,id:J,metadata:i,children:[],style:``,cssClasses:``,slot:``,initialData:void 0,confirmOnNavigationIfDirty:!1}}async function pe(e,t){let n=e.baseUrl??``,r=()=>{let n=v(t);return n?s(n,e.route??``,t.title).fragments?.find(e=>e.component):void 0};if(h(n)){let e=r();if(e)return e;throw Error(`this deployment has no backend to render YAML; send the screen as JSON (uidl)`)}try{let r=(await b.runAction(n,e.route??``,e.consumedRoute??``,_,e.id,e.appState,void 0,{},y(t),e,!0))?.fragments?.find(e=>e.component);if(!r)throw Error(`the backend returned nothing to show`);return r}catch(e){let t=r();if(t)return t;throw e}}async function me(e,t){let n=de(e);if(!n)throw Error(`there is no content area to show it in`);let r=await pe(n,t),i=t.target===`content`?null:(n.shadowRoot??n).querySelector(`mateu-component`);i&&typeof i.applyFragment==`function`?i.applyFragment({targetComponentId:i.id,component:fe(t,r.component,r.state),state:void 0,data:void 0,action:m.Add,containerId:void 0}):n.showTransient(r),f(t.title??c(`chatGeneratedScreen`))}var Z=t=>ee.get()?.renderHeaderIconButton?.(t)??e`
        <button class="chat-header-btn ${t.cssClasses??``}" @click="${t.onClick}"
                title="${t.title??t.label}" aria-label="${t.label}">
            ${i(t.icon,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);`)}
        </button>`,Q=[`#e91e63`,`#1676f3`,`#10b981`,`#8b5cf6`,`#f59e0b`,`#ef4444`],he=e=>Q[Math.abs(e??0)%Q.length],ge=e=>(e??`?`).split(/\s+/).filter(e=>e).map(e=>e[0]).slice(0,2).join(``).toUpperCase()||`?`,$=class extends r{constructor(...e){super(...e),this.menu=[],this.chatSessionId=E(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.label=void 0,this.closable=!0,this.width=le(),this.resizing=!1,this.dragStart=void 0,this.isRtl=()=>getComputedStyle(this).direction===`rtl`,this.onResizeStart=e=>{e.button===0&&(e.preventDefault(),this.dragStart={x:e.clientX,width:this.width},this.resizing=!0,e.currentTarget.setPointerCapture?.(e.pointerId))},this.onResizeMove=e=>{this.dragStart&&(this.width=ue(this.dragStart.width,this.dragStart.x,e.clientX,this.isRtl()))},this.onResizeEnd=e=>{this.dragStart&&(this.dragStart=void 0,this.resizing=!1,e.currentTarget.releasePointerCapture?.(e.pointerId),this.width=q(this.width))},this.onResizeKey=e=>{let t=this.isRtl()?`ArrowLeft`:`ArrowRight`,n=this.isRtl()?`ArrowRight`:`ArrowLeft`,r;e.key===t?r=this.width+24:e.key===n?r=this.width-24:e.key===`Home`?r=U.min:e.key===`End`&&(r=U.max),r!==void 0&&(e.preventDefault(),this.width=q(G(r)))},this.onResizeReset=()=>{this.width=q(U.default)},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.progressTick=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onShortcutKeydown=e=>{V(e)&&this.panelOpen&&this.recognitionAvailable&&(e.preventDefault(),this.startListening())},this.onSpeechResult=e=>{if(this.recognition){let t=e,n=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=n,this.send(new CustomEvent(`submit`,{detail:{value:n},bubbles:!0,composed:!0})))}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{let t=e.target,n=Array.from(t.files??[]);if(t.value=``,n.length&&this.uploadUrl){this.uploading=!0;try{let e=new FormData;e.append(`sessionId`,this.chatSessionId);for(let t of n)e.append(`files`,t,t.name);let t={};Object.assign(t,T(this.uploadUrl));let r=await fetch(this.uploadUrl,{method:`POST`,headers:t,body:e});if(!r.ok)throw Error(`Upload failed: ${r.status}`);let i=((await r.json()).files??[]).filter(e=>e&&e.path);this.attachments=[...this.attachments,...i]}catch(e){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${e instanceof Error?e.message:e}`,`agent`)}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute(`disabled`,`disabled`);let t=e.detail.value.trim(),n=this.sseUrl,r=this.attachments;if(!t&&r.length===0||!n)return;let i=r.length?`${t}${t?`

`:``}📎 ${r.map(e=>e.name).join(`, `)}`:t;this.addMessage(i,`user`),this.attachments=[];let o=this.addMessage(``,`agent`);this.startLoading();let s=``;try{let e=()=>{let e={Accept:`text/event-stream`,"Content-Type":`application/json`};return Object.assign(e,T(n??``)),e},i=this.contextProvider?.(),l=se(document,i?.componentState),d=!!l&&(l.fields.length>0||l.actions.length>0||!!l.title),f=this.enclosingApp(),p=this.menu.length?this.menu:f?.menu??[],m=this.mcpUrl??f?.mcpUrl,h=JSON.stringify({message:t,sessionId:this.chatSessionId,currentRoute:window.location.pathname,...r.length&&{attachments:r},...i!=null&&{context:i},...d&&{screen:l},...m&&{mcpUrl:new URL(m,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(p)}});this.menuContextSent=!0;let g=()=>fetch(n,{method:`POST`,headers:e(),body:h}),_=await g();if(_.status===401&&(_=await a(Error(`401`),g).catch(()=>_)),!_.ok){let e=await _.text();throw Error(u(`chatServerError`,{status:_.status,error:e}))}let v=_.body?.getReader();if(!v)throw Error(`No se pudo obtener el reader del stream.`);let y=new TextDecoder,b=new M,x=new I,S=new L(Date.now());this.progress=S;let C=e=>{let t=P(e);switch(t.kind){case`usage`:F(t.usage)||(this.tokenUsage={...this.tokenUsage,...t.usage});return;case`delta`:s=x.delta(t.text),S.text(Date.now());break;case`text`:s=x.line(t.text),S.text(Date.now());break;case`error`:s=x.error(t.message);break;case`status`:S.status(t.detail,Date.now());break;case`tool`:S.tool(t.detail,Date.now());break;case`event`:this.onAgentEvent(t.event,t.detail);return}this.progressTick++,(t.kind===`delta`||t.kind===`text`||t.kind===`error`)&&this.updateMessage(o,s)};for(;;){let{done:e,value:t}=await v.read();if(e){b.push(y.decode()),b.end().forEach(C);break}b.push(y.decode(t,{stream:!0})).forEach(C)}s||this.updateMessage(o,c(`chatNoAnswer`))}catch(e){console.error(`Error en el flujo SSE:`,e);let t=e?.message??String(e);(t===`Failed to fetch`||t===`network error`||t===`Load failed`)&&!s?this.updateMessage(o,c(`chatConnectionClosed`)):this.updateMessage(o,c(`chatErrorPrefix`)+t)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value=``)},250),this.messageInputElement?.removeAttribute(`disabled`),this.messageInputElement?.focus()}},this.onMessageClick=e=>{let t=ne(e.composedPath().find(e=>e instanceof HTMLAnchorElement)??null,e);if(!t)return;e.preventDefault();let n=re(this.menu,t);n?this.dispatchEvent(new CustomEvent(`navigation-requested`,{detail:n,bubbles:!0,composed:!0})):w(this,t)},this.closeChat=()=>{this.dispatchEvent(new CustomEvent(`close-requested`,{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{let e=this.messageInputElement?.value?.trim()??``;e&&this.send(new CustomEvent(`submit`,{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key===`Enter`&&(e.preventDefault(),this.submitFromInput())}}updated(e){super.updated(e),e.has(`width`)&&this.style.setProperty(`--mateu-chat-width`,`${this.width}px`),this.style.getPropertyValue(`--mateu-chat-wide`)||this.style.setProperty(`--mateu-chat-wide`,`60vw`)}get panelOpen(){return this.isConnected&&this.slot!==`detail-hidden`}connectedCallback(){super.connectedCallback(),window.addEventListener(`keydown`,this.onShortcutKeydown,!0);let e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){let t=new e;this.recognition=t,t.lang=`es-ES`,t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=e=>{console.error(`Error de reconocimiento: `+e.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}disconnectedCallback(){window.removeEventListener(`keydown`,this.onShortcutKeydown,!0),super.disconnectedCallback()}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:`smooth`})},0)}addMessage(e,t){let n={text:e,time:new Date().toLocaleTimeString(),userName:t.includes(`agent`)?j(`title`):c(`chatYou`),userColorIndex:t.includes(`agent`)?2:1};return this.items=[...this.items,n],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((n,r)=>r===e?{...n,text:t}:n),this.scrollBottom()}buildMenuContext(e,t=[]){let n=[];for(let r of e){if(r.separator||r.remote)continue;let e=[...t,r.label];if(r.submenus&&r.submenus.length>0)n.push(...this.buildMenuContext(r.submenus,e));else{let t={path:e,navigation:{route:r.route,consumedRoute:r.consumedRoute,actionId:r.actionId??``,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}};r.description&&(t.description=r.description),r.listing&&(t.listing=r.listing),n.push(t)}}return n}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,this.progress=void 0,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}onAgentEvent(e,t){if(e===`close-requested`&&!this.closable)return;let n=new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!0});if(this.dispatchEvent(n),e===`navigation-requested`&&!n.defaultPrevented){let e=t?.route;typeof e==`string`&&w(this,e)}else if(e===`render-screen`&&!te(n)){let e=S(t);if(!e)return;me(this,e).catch(e=>{console.warn(`[mateu-chat] render-screen`,e),this.addMessage(u(`chatGeneratedScreenFailed`,{error:e instanceof Error?e.message:String(e)}),`agent`)})}}enclosingApp(){for(let e=this;e;e=e.parentNode instanceof ShadowRoot?e.parentNode.host:e.parentNode)if(e instanceof HTMLElement&&e.tagName.toLowerCase()===`mateu-app`){let t=e.component?.metadata;return t?{menu:t.menu,mcpUrl:t.mcpUrl}:void 0}}progressLine(){return this.progress?.line(Date.now())??`Thinking… ${this.elapsedSeconds}s`}renderToolSteps(){let t=this.progress?.steps??[];return t.length?e`
            <ul class="tool-steps" aria-label="${c(`toolsUsed`)}">
                ${t.map(t=>e`
                    <li class="tool-step ${t.running?`running`:t.error?`failed`:`done`}"
                        title="${t.server?`${t.name} (${t.server})`:t.name}">
                        <span class="tool-step-icon">${t.running?`…`:t.error?`✕`:`✓`}</span>
                        <span class="tool-step-name">${t.name}</span>
                        ${t.running?n:e`<span class="tool-step-time">${R(t.ms)}</span>`}
                        ${t.error?e`<span class="tool-step-error">${t.error}</span>`:n}
                    </li>
                `)}
            </ul>
        `:n}render(){return e`
            <div class="chat-container">
                <div class="chat-header">
                    ${i(`vaadin:comments-o`,``,`chat-title-icon`)}
                    <h2 class="chat-title">${this.label?.trim()||j(`title`)}</h2>
                    <div class="chat-header-actions">
                        ${Z({icon:this.expanded?`vaadin:compress`:`vaadin:expand-full`,label:j(this.expanded?`restore`:`expand`),cssClasses:`chat-expand`,onClick:()=>this.toggleExpanded()})}
                        ${this.closable?Z({icon:`lumo:cross`,label:j(`close`),cssClasses:`chat-close`,onClick:()=>this.closeChat()}):n}
                    </div>
                </div>
                <div class="scroll-container">
                    ${this.items.length===0&&!this.loading?e`
                        <div class="chat-empty">
                            ${i(`vaadin:comments-o`,``,`chat-empty-icon`)}
                            <p>${j(`empty`)}</p>
                        </div>`:n}
                    <div class="message-list" role="list" @click="${this.onMessageClick}">
                        ${this.items.map((t,r)=>e`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${he(t.userColorIndex)};">${ge(t.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${t.userName}</span>
                                        <span class="message-time">${t.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${t.text??``}"></mateu-markdown>
                                    ${r===this.items.length-1&&this.loading?this.renderToolSteps():n}
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.tokenUsage?e`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens==null?n:e`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`}
                        ${this.tokenUsage.outputTokens==null?n:e`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`}
                        ${this.tokenUsage.totalTokens==null?n:e`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`}
                    </div>
                `:n}
                ${this.loading?e`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">${this.progressLine()}</span>
                    </div>
                `:n}
                ${this.attachments.length?e`
                    <div class="attachments">
                        ${this.attachments.map(t=>e`
                            <span class="attachment-chip" title="${t.path}">
                                📎 ${t.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(t.path)}" aria-label="${u(`removeNamed`,{name:t.name})}">✕</button>
                            </span>`)}
                    </div>
                `:n}
                <div class="input-bar">
                    ${this.uploadUrl?e`
                        <button class="mic-btn" title="${c(`attachFiles`)}"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="${c(`attachFiles`)}">${this.uploading?`…`:`📎`}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    `:n}
                    <button class="mic-btn"
                            title="${H(this.listening)}"
                            aria-label="${H(this.listening)}"
                            aria-keyshortcuts="${B}"
                            aria-pressed="${this.listening?`true`:`false`}"
                            style="color: ${this.listening?`red`:`var(--lumo-contrast-50pct, #767676)`};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${O}</button>
                    <input class="msg-input"
                           placeholder="${j(`placeholder`)}"
                           aria-label="${j(`placeholder`)}"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">${j(`send`)}</button>
                </div>
                <div class="resize-handle ${this.resizing?`resizing`:``}" role="separator"
                     aria-orientation="vertical" tabindex="0" aria-label="${j(`resize`)}"
                     aria-valuemin="${U.min}" aria-valuemax="${U.max}" aria-valuenow="${this.width}"
                     @pointerdown="${this.onResizeStart}" @pointermove="${this.onResizeMove}"
                     @pointerup="${this.onResizeEnd}" @pointercancel="${this.onResizeEnd}"
                     @keydown="${this.onResizeKey}" @dblclick="${this.onResizeReset}"></div>
            </div>
        `}static{this.styles=[D,t`
        :host {
            display: block;
            height: 100%;
            /* border-box, because the app shell sets padding on this host inline (appRenderer adds
               padding-top so the panel clears the header). Under the default content-box that
               padding is ADDED to the 100%, so the panel ends up taller than the slot that holds
               it and the overflow falls off the bottom of the viewport — which is where the input
               bar lives, so the mic, the field and Send were all clipped when opened. */
            box-sizing: border-box;
        }

        /* Wide mode (⤢): the shell gives the panel ~60% of the viewport (mateu-app's styles,
           --mateu-chat-wide); the conversation keeps a readable measure inside it. */
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
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--lumo-base-color, #fff);
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


        /* The panel's header: its icon and title (a panel title, not a caption), then the
           expand/close buttons grouped at the end — tertiary icon buttons like the app header's. */
        .chat-header {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, .5rem);
            min-height: var(--lumo-size-l, 2.75rem);
            padding: 0.25rem 0.5rem 0.25rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            flex-shrink: 0;
        }
        .chat-title-icon {
            flex-shrink: 0;
            width: var(--lumo-icon-size-m, 1.5rem);
            height: var(--lumo-icon-size-m, 1.5rem);
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .chat-title {
            margin: 0;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
            line-height: var(--lumo-line-height-xs, 1.25);
            color: var(--lumo-header-text-color, #1a1a1a);
        }
        .chat-header-actions {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-xs, .25rem);
            margin-inline-start: auto;
            flex-shrink: 0;
        }
        .chat-header-actions > * {
            margin: 0;
            color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573));
        }
        .chat-header-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            font: inherit;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: var(--lumo-size-m, 2.25rem);
            min-height: var(--lumo-size-m, 2.25rem);
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .chat-header-btn:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .05));
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .chat-header-btn:focus-visible {
            outline: 2px solid var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
            outline-offset: 1px;
        }

        /* Before the first message: what the panel is for. */
        .chat-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--lumo-space-s, .5rem);
            padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem) 0;
            text-align: center;
            color: var(--lumo-secondary-text-color, #5a6573);
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .chat-empty p { margin: 0; max-width: 22rem; }
        .chat-empty-icon {
            width: var(--lumo-icon-size-l, 2.25rem);
            height: var(--lumo-icon-size-l, 2.25rem);
            color: var(--lumo-contrast-30pct, rgba(0, 0, 0, .3));
        }

        /* The edge on the panel's end side: drag it (or ←/→ on it) to resize between 320 and
           720px; a double click resets. Not in wide mode, nor on a phone, where the panel's width
           is the shell's. */
        .resize-handle {
            position: absolute;
            inset-block: 0;
            inset-inline-end: -4px;
            width: 8px;
            cursor: col-resize;
            touch-action: none;
            z-index: 2;
        }
        .resize-handle::after {
            content: '';
            position: absolute;
            inset-block: 0;
            inset-inline-start: 3px;
            width: 2px;
            background: transparent;
            transition: background-color .15s;
        }
        .resize-handle:hover::after, .resize-handle.resizing::after, .resize-handle:focus-visible::after {
            background: var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
        }
        .resize-handle:focus-visible { outline: none; }
        :host([expanded]) .resize-handle { display: none; }
        @media (max-width: 600px) {
            /* a phone: the panel already covers the content — no edge, no wide mode */
            .resize-handle, .chat-expand { display: none; }
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
            color: var(--lumo-secondary-text-color, #5f6b7a);
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
            color: var(--lumo-secondary-text-color, #5f6b7a);
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
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
        }

        /* The tool calls of the turn in course, under the agent's message. */
        .tool-steps {
            list-style: none;
            margin: 0.25rem 0 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #555);
        }
        .tool-step {
            display: flex;
            align-items: baseline;
            gap: 0.4rem;
            min-width: 0;
        }
        .tool-step-icon {
            width: 1em;
            text-align: center;
            flex-shrink: 0;
        }
        .tool-step.done .tool-step-icon { color: var(--lumo-success-text-color, #0a7d3c); }
        .tool-step.failed .tool-step-icon,
        .tool-step-error { color: var(--lumo-error-text-color, #c62828); }
        .tool-step-name {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tool-step-time { font-variant-numeric: tabular-nums; flex-shrink: 0; }
        .tool-step-error {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
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
    `]}};o([d({attribute:!1})],$.prototype,`contextProvider`,void 0),o([d({attribute:!1})],$.prototype,`mcpUrl`,void 0),o([d()],$.prototype,`sseUrl`,void 0),o([d()],$.prototype,`uploadUrl`,void 0),o([d({attribute:!1})],$.prototype,`menu`,void 0),o([l()],$.prototype,`attachments`,void 0),o([l()],$.prototype,`uploading`,void 0),o([g(`.file-input`)],$.prototype,`fileInputElement`,void 0),o([d({type:Boolean,reflect:!0})],$.prototype,`expanded`,void 0),o([d()],$.prototype,`label`,void 0),o([d({type:Boolean})],$.prototype,`closable`,void 0),o([l()],$.prototype,`width`,void 0),o([l()],$.prototype,`resizing`,void 0),o([d()],$.prototype,`items`,void 0),o([g(`.scroll-container`)],$.prototype,`scrollContainer`,void 0),o([g(`.msg-input`)],$.prototype,`messageInputElement`,void 0),o([l()],$.prototype,`recognition`,void 0),o([l()],$.prototype,`listening`,void 0),o([l()],$.prototype,`recognitionAvailable`,void 0),o([l()],$.prototype,`loading`,void 0),o([l()],$.prototype,`elapsedSeconds`,void 0),o([l()],$.prototype,`tokenUsage`,void 0),o([l()],$.prototype,`progress`,void 0),o([l()],$.prototype,`progressTick`,void 0),$=o([C(`mateu-chat`)],$);export{$ as MateuChat,Z as chatHeaderButton};