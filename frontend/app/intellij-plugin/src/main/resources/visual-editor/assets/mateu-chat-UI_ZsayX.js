import{Ct as e,H as t,U as n,a as r,c as i,i as a,k as o,n as s,o as c,p as l,r as u,s as d,t as f}from"./agentEvents-DB5NnwTb.js";import{i as p,n as m,r as h,t as g}from"./decorate-D1ynBJn5.js";import{a as _,d as v,n as y,t as b}from"./lit-DSH4rRgP.js";import{n as x,r as S}from"./chromeTexts-DuaL_oSO.js";import{J as C,et as w,lt as T}from"./index-ClQoVO95.js";import{a as E,r as D}from"./neutralChrome-DdLMX3HQ.js";function O(e){if(!e)return;let t=e.trim();if(t.startsWith(`/`)&&!t.startsWith(`//`))return t}function k(e,t){if(!e||(t.button??0)!==0||t.ctrlKey||t.metaKey||t.shiftKey||t.altKey)return;let n=e.getAttribute(`target`);if(!(n&&n!==`_self`))return O(e.getAttribute(`href`))}function A(e,t){let n=t.split(/[?#]/)[0],r,i=-1,a=e=>{for(let t of e??[]){if(t.separator)continue;if(t.submenus?.length){a(t.submenus);continue}if(t.remote)continue;let e=(t.route??``).split(/[?#]/)[0];e&&e!==`/`&&(n===e||n.startsWith(e.endsWith(`/`)?e:e+`/`))&&e.length>i&&(r=t,i=e.length)}};if(a(e),r)return{route:t,consumedRoute:r.consumedRoute??``,actionId:``,baseUrl:r.baseUrl??``,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}}function j(e,t,n=new Set){if(e&&typeof e==`object`&&!n.has(e)){n.add(e),Array.isArray(e)||t(e);for(let r of Array.isArray(e)?e:Object.values(e))r&&typeof r==`object`&&j(r,t,n)}}var M=e=>e&&e.metadata&&typeof e.metadata.type==`string`?e.metadata.type:void 0;function N(e,t){if(!e||typeof e!=`object`)return{fields:[],actions:[]};let n=[],r=new Map,i;j(e,e=>{let t=M(e);t===`FormField`&&e.metadata.fieldId?n.push(e.metadata):t===`Page`&&!i?i=e.metadata:t===`Button`&&e.metadata.actionId&&(r.has(e.metadata.actionId)||r.set(e.metadata.actionId,e.metadata.label))});let a=t&&typeof t==`object`?t:e.initialData&&typeof e.initialData==`object`?e.initialData:{},o=new Set,s=[];for(let e of n){if(o.has(e.fieldId))continue;o.add(e.fieldId);let t={id:e.fieldId,label:e.label??e.fieldId,dataType:e.dataType??`string`,stereotype:e.stereotype??`regular`,required:!!e.required,readOnly:!!e.readOnly};a&&Object.prototype.hasOwnProperty.call(a,e.fieldId)&&(t.value=a[e.fieldId]),Array.isArray(e.options)&&e.options.length&&(t.options=e.options.map(e=>e&&typeof e==`object`?{value:e.value,label:e.label??String(e.value??``)}:{value:e,label:String(e)})),s.push(t)}let c=[],l=new Set;for(let t of Array.isArray(e.actions)?e.actions:[]){if(!t||!t.id||l.has(t.id))continue;l.add(t.id);let e={id:t.id,label:r.get(t.id)??t.id};t.shortcut&&(e.shortcut=t.shortcut),c.push(e)}for(let[e,t]of r)l.has(e)||(l.add(e),c.push({id:e,label:t??e}));let u={fields:s,actions:c},d=i&&(i.pageTitle||i.title)||void 0;return d&&(u.title=d),e.route&&(u.route=e.route),e.serverSideType&&(u.serverSideType=e.serverSideType),(e.pageType||i&&i.pageType)&&(u.pageType=e.pageType||i.pageType),u}function P(e){let t=[],n=e=>{let r=e.shadowRoot??e;(r.querySelectorAll?.(`mateu-component`))?.forEach(e=>{let r=e.component;r&&t.push(r),e.shadowRoot&&n(e)}),r.querySelectorAll?.(`*`).forEach(e=>{e.shadowRoot&&e.tagName!==`MATEU-COMPONENT`&&n(e)})};return n(e),t}function F(e=document,t){let n=null,r=-1;for(let i of P(e)){let e=N(i,t),a=e.fields.length+e.actions.length+ +!!e.title;a>r&&(n=e,r=a)}return n}var I=`Ctrl+Shift+M`,L=`Control+Shift+M`,R=e=>{if(!e||!e.ctrlKey||!e.shiftKey||e.altKey||e.metaKey||e.repeat)return!1;let t=typeof e.key==`string`?e.key:``;return/^[a-z]$/i.test(t)?t.toLowerCase()===`m`:e.code===`KeyM`},z=(e,t)=>`${i(e?`stopDictation`:`dictate`,t)} (${I})`,B={default:460,min:320,max:720},V=`mateu-chat-width`,H=e=>e==null||!Number.isFinite(e)?B.default:Math.round(Math.min(B.max,Math.max(B.min,e))),U=()=>{try{return typeof localStorage>`u`?void 0:localStorage}catch{return}},W=(e=U())=>{try{let t=e?.getItem(V);return t?H(Number(t)):B.default}catch{return B.default}},G=(e,t=U())=>{let n=H(e);try{t?.setItem(V,String(n))}catch{}return n},K=(e,t,n,r=!1)=>H(e+(r?t-n:n-t)),q=e=>w.get()?.renderHeaderIconButton?.(e)??_`
        <button class="chat-header-btn ${e.cssClasses??``}" @click="${e.onClick}"
                title="${e.title??e.label}" aria-label="${e.label}">
            ${C(e.icon,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);`)}
        </button>`,J=[`#e91e63`,`#1676f3`,`#10b981`,`#8b5cf6`,`#f59e0b`,`#ef4444`],Y=e=>J[Math.abs(e??0)%J.length],X=e=>(e??`?`).split(/\s+/).filter(e=>e).map(e=>e[0]).slice(0,2).join(``).toUpperCase()||`?`,Z=class extends b{constructor(...t){super(...t),this.menu=[],this.fallbackSessionId=n(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.label=void 0,this.closable=!0,this.width=W(),this.resizing=!1,this.dragStart=void 0,this.isRtl=()=>getComputedStyle(this).direction===`rtl`,this.onResizeStart=e=>{e.button===0&&(e.preventDefault(),this.dragStart={x:e.clientX,width:this.width},this.resizing=!0,e.currentTarget.setPointerCapture?.(e.pointerId))},this.onResizeMove=e=>{this.dragStart&&(this.width=K(this.dragStart.width,this.dragStart.x,e.clientX,this.isRtl()))},this.onResizeEnd=e=>{this.dragStart&&(this.dragStart=void 0,this.resizing=!1,e.currentTarget.releasePointerCapture?.(e.pointerId),this.width=G(this.width))},this.onResizeKey=e=>{let t=this.isRtl()?`ArrowLeft`:`ArrowRight`,n=this.isRtl()?`ArrowRight`:`ArrowLeft`,r;e.key===t?r=this.width+24:e.key===n?r=this.width-24:e.key===`Home`?r=B.min:e.key===`End`&&(r=B.max),r!==void 0&&(e.preventDefault(),this.width=G(H(r)))},this.onResizeReset=()=>{this.width=G(B.default)},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.progressTick=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onShortcutKeydown=e=>{R(e)&&this.panelOpen&&this.recognitionAvailable&&(e.preventDefault(),this.startListening())},this.onSpeechResult=e=>{if(this.recognition){let t=e,n=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=n,this.send(new CustomEvent(`submit`,{detail:{value:n},bubbles:!0,composed:!0})))}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{let t=e.target,n=Array.from(t.files??[]);if(t.value=``,n.length&&this.uploadUrl){this.uploading=!0;try{let e=new FormData;e.append(`sessionId`,this.chatSessionId);for(let t of n)e.append(`files`,t,t.name);let t={};Object.assign(t,o(this.uploadUrl));let r=await fetch(this.uploadUrl,{method:`POST`,headers:t,body:e});if(!r.ok)throw Error(`Upload failed: ${r.status}`);let i=((await r.json()).files??[]).filter(e=>e&&e.path);this.attachments=[...this.attachments,...i]}catch(e){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${e instanceof Error?e.message:e}`,`agent`)}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async t=>{this.messageInputElement?.setAttribute(`disabled`,`disabled`);let n=t.detail.value.trim(),i=this.sseUrl,c=this.attachments;if(!n&&c.length===0||!i)return;let l=c.length?`${n}${n?`

`:``}📎 ${c.map(e=>e.name).join(`, `)}`:n;this.addMessage(l,`user`),this.attachments=[];let f=this.addMessage(``,`agent`);this.startLoading();let p=``;try{let t=()=>{let e={Accept:`text/event-stream`,"Content-Type":`application/json`};return Object.assign(e,o(i??``)),e},l=this.contextProvider?.(),m=F(document,l?.componentState),h=!!m&&(m.fields.length>0||m.actions.length>0||!!m.title),g=this.enclosingApp(),_=this.menu.length?this.menu:g?.menu??[],v=this.mcpUrl??g?.mcpUrl,y=JSON.stringify({message:n,sessionId:this.chatSessionId,currentRoute:window.location.pathname,...c.length&&{attachments:c},...l!=null&&{context:l},...h&&{screen:m},...v&&{mcpUrl:new URL(v,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(_)}});this.menuContextSent=!0;let b=()=>fetch(i,{method:`POST`,headers:t(),body:y}),C=await b();if(C.status===401&&(C=await e(Error(`401`),b).catch(()=>C)),!C.ok){let e=await C.text();throw Error(S(`chatServerError`,{status:C.status,error:e}))}let w=C.body?.getReader();if(!w)throw Error(`No se pudo obtener el reader del stream.`);let T=new TextDecoder,E=new a,D=new s,O=new u(Date.now());this.progress=O;let k=e=>{let t=r(e);switch(t.kind){case`usage`:d(t.usage)||(this.tokenUsage={...this.tokenUsage,...t.usage});return;case`delta`:p=D.delta(t.text),O.text(Date.now());break;case`text`:p=D.line(t.text),O.text(Date.now());break;case`error`:p=D.error(t.message);break;case`status`:O.status(t.detail,Date.now());break;case`tool`:O.tool(t.detail,Date.now());break;case`event`:this.onAgentEvent(t.event,t.detail);return}this.progressTick++,(t.kind===`delta`||t.kind===`text`||t.kind===`error`)&&this.updateMessage(f,p)};for(;;){let{done:e,value:t}=await w.read();if(e){E.push(T.decode()),E.end().forEach(k);break}E.push(T.decode(t,{stream:!0})).forEach(k)}p||this.updateMessage(f,x(`chatNoAnswer`))}catch(e){console.error(`Error en el flujo SSE:`,e);let t=e?.message??String(e);(t===`Failed to fetch`||t===`network error`||t===`Load failed`)&&!p?this.updateMessage(f,x(`chatConnectionClosed`)):this.updateMessage(f,x(`chatErrorPrefix`)+t)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value=``)},250),this.messageInputElement?.removeAttribute(`disabled`),this.messageInputElement?.focus()}},this.onMessageClick=e=>{let t=k(e.composedPath().find(e=>e instanceof HTMLAnchorElement)??null,e);if(!t)return;e.preventDefault();let n=A(this.menu,t);n?this.dispatchEvent(new CustomEvent(`navigation-requested`,{detail:n,bubbles:!0,composed:!0})):l(this,t)},this.closeChat=()=>{this.dispatchEvent(new CustomEvent(`close-requested`,{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{let e=this.messageInputElement?.value?.trim()??``;e&&this.send(new CustomEvent(`submit`,{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key===`Enter`&&(e.preventDefault(),this.submitFromInput())}}get chatSessionId(){return t()??this.fallbackSessionId}updated(e){super.updated(e),e.has(`width`)&&this.style.setProperty(`--mateu-chat-width`,`${this.width}px`),this.style.getPropertyValue(`--mateu-chat-wide`)||this.style.setProperty(`--mateu-chat-wide`,`60vw`)}get panelOpen(){return this.isConnected&&this.slot!==`detail-hidden`}connectedCallback(){super.connectedCallback(),window.addEventListener(`keydown`,this.onShortcutKeydown,!0);let e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){let t=new e;this.recognition=t,t.lang=`es-ES`,t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=e=>{console.error(`Error de reconocimiento: `+e.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}disconnectedCallback(){window.removeEventListener(`keydown`,this.onShortcutKeydown,!0),super.disconnectedCallback()}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:`smooth`})},0)}addMessage(e,t){let n={text:e,time:new Date().toLocaleTimeString(),userName:t.includes(`agent`)?i(`title`):x(`chatYou`),userColorIndex:t.includes(`agent`)?2:1};return this.items=[...this.items,n],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((n,r)=>r===e?{...n,text:t}:n),this.scrollBottom()}buildMenuContext(e,t=[]){let n=[];for(let r of e){if(r.separator||r.remote)continue;let e=[...t,r.label];if(r.submenus&&r.submenus.length>0)n.push(...this.buildMenuContext(r.submenus,e));else{let t={path:e,navigation:{route:r.route,consumedRoute:r.consumedRoute,actionId:r.actionId??``,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}};r.description&&(t.description=r.description),r.listing&&(t.listing=r.listing),n.push(t)}}return n}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,this.progress=void 0,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}onAgentEvent(e,t){(e!==`close-requested`||this.closable)&&f(this,e,t,{onRenderFailed:e=>this.addMessage(S(`chatGeneratedScreenFailed`,{error:e instanceof Error?e.message:String(e)}),`agent`)})}enclosingApp(){for(let e=this;e;e=e.parentNode instanceof ShadowRoot?e.parentNode.host:e.parentNode)if(e instanceof HTMLElement&&e.tagName.toLowerCase()===`mateu-app`){let t=e.component?.metadata;return t?{menu:t.menu,mcpUrl:t.mcpUrl}:void 0}}progressLine(){return this.progress?.line(Date.now())??`Thinking… ${this.elapsedSeconds}s`}renderToolSteps(){let e=this.progress?.steps??[];return e.length?_`
            <ul class="tool-steps" aria-label="${x(`toolsUsed`)}">
                ${e.map(e=>_`
                    <li class="tool-step ${e.running?`running`:e.error?`failed`:`done`}"
                        title="${e.server?`${e.name} (${e.server})`:e.name}">
                        <span class="tool-step-icon">${e.running?`…`:e.error?`✕`:`✓`}</span>
                        <span class="tool-step-name">${e.name}</span>
                        ${e.running?y:_`<span class="tool-step-time">${c(e.ms)}</span>`}
                        ${e.error?_`<span class="tool-step-error">${e.error}</span>`:y}
                    </li>
                `)}
            </ul>
        `:y}render(){return _`
            <div class="chat-container">
                <div class="chat-header">
                    ${C(`vaadin:comments-o`,``,`chat-title-icon`)}
                    <h2 class="chat-title">${this.label?.trim()||i(`title`)}</h2>
                    <div class="chat-header-actions">
                        ${q({icon:this.expanded?`vaadin:compress`:`vaadin:expand-full`,label:i(this.expanded?`restore`:`expand`),cssClasses:`chat-expand`,onClick:()=>this.toggleExpanded()})}
                        ${this.closable?q({icon:`lumo:cross`,label:i(`close`),cssClasses:`chat-close`,onClick:()=>this.closeChat()}):y}
                    </div>
                </div>
                <div class="scroll-container">
                    ${this.items.length===0&&!this.loading?_`
                        <div class="chat-empty">
                            ${C(`vaadin:comments-o`,``,`chat-empty-icon`)}
                            <p>${i(`empty`)}</p>
                        </div>`:y}
                    <div class="message-list" role="list" @click="${this.onMessageClick}">
                        ${this.items.map((e,t)=>_`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Y(e.userColorIndex)};">${X(e.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${e.userName}</span>
                                        <span class="message-time">${e.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${e.text??``}"></mateu-markdown>
                                    ${t===this.items.length-1&&this.loading?this.renderToolSteps():y}
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.tokenUsage?_`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens==null?y:_`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`}
                        ${this.tokenUsage.outputTokens==null?y:_`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`}
                        ${this.tokenUsage.totalTokens==null?y:_`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`}
                    </div>
                `:y}
                ${this.loading?_`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">${this.progressLine()}</span>
                    </div>
                `:y}
                ${this.attachments.length?_`
                    <div class="attachments">
                        ${this.attachments.map(e=>_`
                            <span class="attachment-chip" title="${e.path}">
                                📎 ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="${S(`removeNamed`,{name:e.name})}">✕</button>
                            </span>`)}
                    </div>
                `:y}
                <div class="input-bar">
                    ${this.uploadUrl?_`
                        <button class="mic-btn" title="${x(`attachFiles`)}"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="${x(`attachFiles`)}">${this.uploading?`…`:`📎`}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    `:y}
                    <button class="mic-btn"
                            title="${z(this.listening)}"
                            aria-label="${z(this.listening)}"
                            aria-keyshortcuts="${L}"
                            aria-pressed="${this.listening?`true`:`false`}"
                            style="color: ${this.listening?`red`:`var(--lumo-contrast-50pct, #767676)`};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${D}</button>
                    <input class="msg-input"
                           placeholder="${i(`placeholder`)}"
                           aria-label="${i(`placeholder`)}"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">${i(`send`)}</button>
                </div>
                <div class="resize-handle ${this.resizing?`resizing`:``}" role="separator"
                     aria-orientation="vertical" tabindex="0" aria-label="${i(`resize`)}"
                     aria-valuemin="${B.min}" aria-valuemax="${B.max}" aria-valuenow="${this.width}"
                     @pointerdown="${this.onResizeStart}" @pointermove="${this.onResizeMove}"
                     @pointerup="${this.onResizeEnd}" @pointercancel="${this.onResizeEnd}"
                     @keydown="${this.onResizeKey}" @dblclick="${this.onResizeReset}"></div>
            </div>
        `}static{this.styles=[E,v`
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
    `]}};g([h({attribute:!1})],Z.prototype,`contextProvider`,void 0),g([h({attribute:!1})],Z.prototype,`mcpUrl`,void 0),g([h()],Z.prototype,`sseUrl`,void 0),g([h()],Z.prototype,`uploadUrl`,void 0),g([h({attribute:!1})],Z.prototype,`menu`,void 0),g([m()],Z.prototype,`attachments`,void 0),g([m()],Z.prototype,`uploading`,void 0),g([T(`.file-input`)],Z.prototype,`fileInputElement`,void 0),g([h({type:Boolean,reflect:!0})],Z.prototype,`expanded`,void 0),g([h()],Z.prototype,`label`,void 0),g([h({type:Boolean})],Z.prototype,`closable`,void 0),g([m()],Z.prototype,`width`,void 0),g([m()],Z.prototype,`resizing`,void 0),g([h()],Z.prototype,`items`,void 0),g([T(`.scroll-container`)],Z.prototype,`scrollContainer`,void 0),g([T(`.msg-input`)],Z.prototype,`messageInputElement`,void 0),g([m()],Z.prototype,`recognition`,void 0),g([m()],Z.prototype,`listening`,void 0),g([m()],Z.prototype,`recognitionAvailable`,void 0),g([m()],Z.prototype,`loading`,void 0),g([m()],Z.prototype,`elapsedSeconds`,void 0),g([m()],Z.prototype,`tokenUsage`,void 0),g([m()],Z.prototype,`progress`,void 0),g([m()],Z.prototype,`progressTick`,void 0),Z=g([p(`mateu-chat`)],Z);export{Z as MateuChat,q as chatHeaderButton};