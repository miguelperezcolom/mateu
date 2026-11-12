import{i as e,n as t,r as n,t as r}from"./decorate-D1ynBJn5.js";import{a as i,d as a,n as o,t as s}from"./lit-DSH4rRgP.js";import{C as c,i as l,vt as u}from"./rowRoute-D0vXkyYy.js";import{a as d,f}from"./authToken-CuhjhV4m.js";import{i as p,r as m}from"./chromeTexts-H3kF_lzN.js";import{a as ee,c as h,i as g,n as _,o as v,r as y,s as b,t as x}from"./agentEvents-zfQfIVIr.js";import{Ft as S,Jt as C,Pt as w}from"./index-D2EJW55F.js";import{a as T,o as E,r as D}from"./neutralChrome-OLimXS4g.js";function O(e){if(!e)return;let t=e.trim();if(t.startsWith(`/`)&&!t.startsWith(`//`))return t}function k(e,t){if(!e||(t.button??0)!==0||t.ctrlKey||t.metaKey||t.shiftKey||t.altKey)return;let n=e.getAttribute(`target`);if(!(n&&n!==`_self`))return O(e.getAttribute(`href`))}function A(e,t){let n=t.split(/[?#]/)[0],r,i=-1,a=e=>{for(let t of e??[]){if(t.separator)continue;if(t.submenus?.length){a(t.submenus);continue}if(t.remote)continue;let e=(t.route??``).split(/[?#]/)[0];e&&e!==`/`&&(n===e||n.startsWith(e.endsWith(`/`)?e:e+`/`))&&e.length>i&&(r=t,i=e.length)}};if(a(e),r)return{route:t,consumedRoute:r.consumedRoute??``,actionId:``,baseUrl:r.baseUrl??``,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}}function j(e,t,n=new Set){if(e&&typeof e==`object`&&!n.has(e)){n.add(e),Array.isArray(e)||t(e);for(let r of Array.isArray(e)?e:Object.values(e))r&&typeof r==`object`&&j(r,t,n)}}var M=e=>e&&e.metadata&&typeof e.metadata.type==`string`?e.metadata.type:void 0;function te(e,t){if(!e||typeof e!=`object`)return{fields:[],actions:[]};let n=[],r=new Map,i;j(e,e=>{let t=M(e);t===`FormField`&&e.metadata.fieldId?n.push(e.metadata):t===`Page`&&!i?i=e.metadata:t===`Button`&&e.metadata.actionId&&(r.has(e.metadata.actionId)||r.set(e.metadata.actionId,e.metadata.label))});let a=t&&typeof t==`object`?t:e.initialData&&typeof e.initialData==`object`?e.initialData:{},o=new Set,s=[];for(let e of n){if(o.has(e.fieldId))continue;o.add(e.fieldId);let t={id:e.fieldId,label:e.label??e.fieldId,dataType:e.dataType??`string`,stereotype:e.stereotype??`regular`,required:!!e.required,readOnly:!!e.readOnly};a&&Object.prototype.hasOwnProperty.call(a,e.fieldId)&&(t.value=a[e.fieldId]),Array.isArray(e.options)&&e.options.length&&(t.options=e.options.map(e=>e&&typeof e==`object`?{value:e.value,label:e.label??String(e.value??``)}:{value:e,label:String(e)})),s.push(t)}let c=[],l=new Set;for(let t of Array.isArray(e.actions)?e.actions:[]){if(!t||!t.id||l.has(t.id))continue;l.add(t.id);let e={id:t.id,label:r.get(t.id)??t.id};t.shortcut&&(e.shortcut=t.shortcut),c.push(e)}for(let[e,t]of r)l.has(e)||(l.add(e),c.push({id:e,label:t??e}));let u={fields:s,actions:c},d=i&&(i.pageTitle||i.title)||void 0;return d&&(u.title=d),e.route&&(u.route=e.route),e.serverSideType&&(u.serverSideType=e.serverSideType),(e.pageType||i&&i.pageType)&&(u.pageType=e.pageType||i.pageType),u}function N(e){let t=[],n=e=>{let r=e.shadowRoot??e;(r.querySelectorAll?.(`mateu-component`))?.forEach(e=>{let r=e.component;r&&t.push(r),e.shadowRoot&&n(e)}),r.querySelectorAll?.(`*`).forEach(e=>{e.shadowRoot&&e.tagName!==`MATEU-COMPONENT`&&n(e)})};return n(e),t}function ne(e=document,t){let n=null,r=-1;for(let i of N(e)){let e=te(i,t),a=e.fields.length+e.actions.length+ +!!e.title;a>r&&(n=e,r=a)}return n}var P=`Ctrl+Shift+M`,F=`Control+Shift+M`,I=e=>{if(!e||!e.ctrlKey||!e.shiftKey||e.altKey||e.metaKey||e.repeat)return!1;let t=typeof e.key==`string`?e.key:``;return/^[a-z]$/i.test(t)?t.toLowerCase()===`m`:e.code===`KeyM`},L=(e,t)=>`${h(e?`stopDictation`:`dictate`,t)} (${P})`,R={default:460,min:320,max:720},z=`mateu-chat-width`,B=e=>e==null||!Number.isFinite(e)?R.default:Math.round(Math.min(R.max,Math.max(R.min,e))),V=()=>{try{return typeof localStorage>`u`?void 0:localStorage}catch{return}},H=(e=V())=>{try{let t=e?.getItem(z);return t?B(Number(t)):R.default}catch{return R.default}},U=(e,t=V())=>{let n=B(e);try{t?.setItem(z,String(n))}catch{}return n},W=(e,t,n,r=!1)=>B(e+(r?t-n:n-t)),G=`mateu-chat-follow`,K=(e=V())=>{try{return e?.getItem(G)!==`off`}catch{return!0}},q=(e,t=V())=>{try{t?.setItem(G,e?`on`:`off`)}catch{}return e},J=e=>e===`navigation-requested`||e===`render-screen`;function Y(e,t,n){if(e===`navigation-requested`){let e=t?.route;return typeof e==`string`&&e.trim()?p(`chatOpenDeferredRoute`,{route:e.trim()},n):m(`chatOpenDeferredScreen`,n)}return m(`chatShowDeferredScreen`,n)}var X=(e,t,n)=>({name:e,detail:t,label:Y(e,t,n)}),Z=e=>S.get()?.renderHeaderIconButton?.(e)??i`
        <button class="chat-header-btn ${e.cssClasses??``}" @click="${e.onClick}"
                title="${e.title??e.label}" aria-label="${e.label}"
                aria-pressed="${e.pressed===void 0?o:String(e.pressed)}">
            ${w(e.icon,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);`)}
        </button>`,Q=[`#e91e63`,`#1676f3`,`#10b981`,`#8b5cf6`,`#f59e0b`,`#ef4444`],re=e=>Q[Math.abs(e??0)%Q.length],ie=e=>(e??`?`).split(/\s+/).filter(e=>e).map(e=>e[0]).slice(0,2).join(``).toUpperCase()||`?`,$=class extends s{constructor(...e){super(...e),this.menu=[],this.fallbackSessionId=f(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.follow=K(),this.toggleFollow=()=>{this.follow=q(!this.follow)},this.followLabel=void 0,this.followingLabel=void 0,this.label=void 0,this.closable=!0,this.width=H(),this.resizing=!1,this.dragStart=void 0,this.isRtl=()=>getComputedStyle(this).direction===`rtl`,this.onResizeStart=e=>{e.button===0&&(e.preventDefault(),this.dragStart={x:e.clientX,width:this.width},this.resizing=!0,e.currentTarget.setPointerCapture?.(e.pointerId))},this.onResizeMove=e=>{this.dragStart&&(this.width=W(this.dragStart.width,this.dragStart.x,e.clientX,this.isRtl()))},this.onResizeEnd=e=>{this.dragStart&&(this.dragStart=void 0,this.resizing=!1,e.currentTarget.releasePointerCapture?.(e.pointerId),this.width=U(this.width))},this.onResizeKey=e=>{let t=this.isRtl()?`ArrowLeft`:`ArrowRight`,n=this.isRtl()?`ArrowRight`:`ArrowLeft`,r;e.key===t?r=this.width+24:e.key===n?r=this.width-24:e.key===`Home`?r=R.min:e.key===`End`&&(r=R.max),r!==void 0&&(e.preventDefault(),this.width=U(B(r)))},this.onResizeReset=()=>{this.width=U(R.default)},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.progressTick=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onShortcutKeydown=e=>{I(e)&&this.panelOpen&&this.recognitionAvailable&&(e.preventDefault(),this.startListening())},this.onSpeechResult=e=>{if(this.recognition){let t=e,n=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=n,this.send(new CustomEvent(`submit`,{detail:{value:n},bubbles:!0,composed:!0})))}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{let t=e.target,n=Array.from(t.files??[]);if(t.value=``,n.length&&this.uploadUrl){this.uploading=!0;try{let e=new FormData;e.append(`sessionId`,this.chatSessionId);for(let t of n)e.append(`files`,t,t.name);let t={};Object.assign(t,c(this.uploadUrl));let r=await fetch(this.uploadUrl,{method:`POST`,headers:t,body:e});if(!r.ok)throw Error(`Upload failed: ${r.status}`);let i=((await r.json()).files??[]).filter(e=>e&&e.path);this.attachments=[...this.attachments,...i]}catch(e){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${e instanceof Error?e.message:e}`,`agent`)}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute(`disabled`,`disabled`);let t=e.detail.value.trim(),n=this.sseUrl,r=this.attachments;if(!t&&r.length===0||!n)return;let i=r.length?`${t}${t?`

`:``}📎 ${r.map(e=>e.name).join(`, `)}`:t;this.addMessage(i,`user`),this.attachments=[];let a=this.addMessage(``,`agent`);this.startLoading();let o=``;try{let e=()=>{let e={Accept:`text/event-stream`,"Content-Type":`application/json`};return Object.assign(e,c(n??``)),e},i=this.contextProvider?.(),s=ne(document,i?.componentState),l=!!s&&(s.fields.length>0||s.actions.length>0||!!s.title),d=this.enclosingApp(),f=this.menu.length?this.menu:d?.menu??[],h=this.mcpUrl??d?.mcpUrl,v=JSON.stringify({message:t,sessionId:this.chatSessionId,currentRoute:window.location.pathname,...r.length&&{attachments:r},...i!=null&&{context:i},...l&&{screen:s},...h&&{mcpUrl:new URL(h,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(f)}});this.menuContextSent=!0;let x=()=>fetch(n,{method:`POST`,headers:e(),body:v}),S=await x();if(S.status===401&&(S=await u(Error(`401`),x).catch(()=>S)),!S.ok){let e=await S.text();throw Error(p(`chatServerError`,{status:S.status,error:e}))}let C=S.body?.getReader();if(!C)throw Error(`No se pudo obtener el reader del stream.`);let w=new TextDecoder,T=new g,E=new _,D=new y(Date.now());this.progress=D;let O=e=>{let t=ee(e);switch(t.kind){case`usage`:b(t.usage)||(this.tokenUsage={...this.tokenUsage,...t.usage});return;case`delta`:o=E.delta(t.text),D.text(Date.now());break;case`text`:o=E.line(t.text),D.text(Date.now());break;case`error`:o=E.error(t.message);break;case`status`:D.status(t.detail,Date.now());break;case`tool`:D.tool(t.detail,Date.now());break;case`event`:this.onAgentEvent(t.event,t.detail);return}this.progressTick++,(t.kind===`delta`||t.kind===`text`||t.kind===`error`)&&this.updateMessage(a,o)};for(;;){let{done:e,value:t}=await C.read();if(e){T.push(w.decode()),T.end().forEach(O);break}T.push(w.decode(t,{stream:!0})).forEach(O)}o||this.updateMessage(a,m(`chatNoAnswer`))}catch(e){console.error(`Error en el flujo SSE:`,e);let t=e?.message??String(e);(t===`Failed to fetch`||t===`network error`||t===`Load failed`)&&!o?this.updateMessage(a,m(`chatConnectionClosed`)):this.updateMessage(a,m(`chatErrorPrefix`)+t)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value=``)},250),this.messageInputElement?.removeAttribute(`disabled`),this.messageInputElement?.focus()}},this.onMessageClick=e=>{let t=k(e.composedPath().find(e=>e instanceof HTMLAnchorElement)??null,e);if(!t)return;e.preventDefault();let n=A(this.menu,t);n?this.dispatchEvent(new CustomEvent(`navigation-requested`,{detail:n,bubbles:!0,composed:!0})):l(this,t)},this.closeChat=()=>{this.dispatchEvent(new CustomEvent(`close-requested`,{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{let e=this.messageInputElement?.value?.trim()??``;e&&this.send(new CustomEvent(`submit`,{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key===`Enter`&&(e.preventDefault(),this.submitFromInput())}}get chatSessionId(){return d()??this.fallbackSessionId}updated(e){super.updated(e),e.has(`width`)&&this.style.setProperty(`--mateu-chat-width`,`${this.width}px`),this.style.getPropertyValue(`--mateu-chat-wide`)||this.style.setProperty(`--mateu-chat-wide`,`60vw`)}get panelOpen(){return this.isConnected&&this.slot!==`detail-hidden`}connectedCallback(){super.connectedCallback(),window.addEventListener(`keydown`,this.onShortcutKeydown,!0);let e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){let t=new e;this.recognition=t,t.lang=`es-ES`,t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=e=>{console.error(`Error de reconocimiento: `+e.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}disconnectedCallback(){window.removeEventListener(`keydown`,this.onShortcutKeydown,!0),super.disconnectedCallback()}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:`smooth`})},0)}addMessage(e,t){let n={text:e,time:new Date().toLocaleTimeString(),userName:t.includes(`agent`)?h(`title`):m(`chatYou`),userColorIndex:t.includes(`agent`)?2:1};return this.items=[...this.items,n],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((n,r)=>r===e?{...n,text:t}:n),this.scrollBottom()}buildMenuContext(e,t=[]){let n=[];for(let r of e){if(r.separator||r.remote)continue;let e=[...t,r.label];if(r.submenus&&r.submenus.length>0)n.push(...this.buildMenuContext(r.submenus,e));else{let t={path:e,navigation:{route:r.route,consumedRoute:r.consumedRoute,actionId:r.actionId??``,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}};r.description&&(t.description=r.description),r.listing&&(t.listing=r.listing),n.push(t)}}return n}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,this.progress=void 0,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}onAgentEvent(e,t){(e!==`close-requested`||this.closable)&&(!this.follow&&J(e)?this.deferOnLastAnswer(X(e,t)):this.applyAgentEventNow(e,t))}deferOnLastAnswer(e){let t=this.items.length-1;for(;t>=0&&this.items[t].userColorIndex!==2;)t--;t<0&&(t=this.addMessage(``,`agent`)),this.items=this.items.map((n,r)=>r===t?{...n,deferred:[...n.deferred??[],e]}:n),this.scrollBottom()}applyAgentEventNow(e,t){x(this,e,t,{onRenderFailed:e=>this.addMessage(p(`chatGeneratedScreenFailed`,{error:e instanceof Error?e.message:String(e)}),`agent`)})}enclosingApp(){for(let e=this;e;e=e.parentNode instanceof ShadowRoot?e.parentNode.host:e.parentNode)if(e instanceof HTMLElement&&e.tagName.toLowerCase()===`mateu-app`){let t=e.component?.metadata;return t?{menu:t.menu,mcpUrl:t.mcpUrl}:void 0}}progressLine(){return this.progress?.line(Date.now())??`Thinking… ${this.elapsedSeconds}s`}renderToolSteps(){let e=this.progress?.steps??[];return e.length?i`
            <ul class="tool-steps" aria-label="${m(`toolsUsed`)}">
                ${e.map(e=>i`
                    <li class="tool-step ${e.running?`running`:e.error?`failed`:`done`}"
                        title="${e.server?`${e.name} (${e.server})`:e.name}">
                        <span class="tool-step-icon">${e.running?`…`:e.error?`✕`:`✓`}</span>
                        <span class="tool-step-name">${e.name}</span>
                        ${e.running?o:i`<span class="tool-step-time">${v(e.ms)}</span>`}
                        ${e.error?i`<span class="tool-step-error">${e.error}</span>`:o}
                    </li>
                `)}
            </ul>
        `:o}render(){return i`
            <div class="chat-container">
                <div class="chat-header">
                    ${w(`vaadin:comments-o`,``,`chat-title-icon`)}
                    <h2 class="chat-title">${this.label?.trim()||h(`title`)}</h2>
                    <div class="chat-header-actions">
                        <button type="button" class="nbtn chat-follow ${this.follow?`following`:``}"
                                aria-pressed="${this.follow?`true`:`false`}"
                                title="${h(this.follow?`followOn`:`followOff`)}"
                                @click="${this.toggleFollow}">
                            ${T}
                            <span>${this.follow?this.followingLabel?.trim()||h(`following`):this.followLabel?.trim()||h(`follow`)}</span>
                        </button>
                        ${Z({icon:this.expanded?`vaadin:compress`:`vaadin:expand-full`,label:h(this.expanded?`restore`:`expand`),cssClasses:`chat-expand`,onClick:()=>this.toggleExpanded()})}
                        ${this.closable?Z({icon:`lumo:cross`,label:h(`close`),cssClasses:`chat-close`,onClick:()=>this.closeChat()}):o}
                    </div>
                </div>
                <div class="scroll-container">
                    ${this.items.length===0&&!this.loading?i`
                        <div class="chat-empty">
                            ${w(`vaadin:comments-o`,``,`chat-empty-icon`)}
                            <p>${h(`empty`)}</p>
                        </div>`:o}
                    <div class="message-list" role="list" @click="${this.onMessageClick}">
                        ${this.items.map((e,t)=>i`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${re(e.userColorIndex)};">${ie(e.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${e.userName}</span>
                                        <span class="message-time">${e.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${e.text??``}"></mateu-markdown>
                                    ${e.deferred?.length?i`
                                        <div class="chat-deferred">
                                            ${e.deferred.map(e=>i`
                                                <button type="button" class="chat-deferred-action"
                                                        @click="${()=>this.applyAgentEventNow(e.name,e.detail)}">
                                                    ${w(e.name===`render-screen`?`vaadin:viewport`:`vaadin:arrow-right`,`width: 1em; height: 1em;`)}
                                                    <span>${e.label}</span>
                                                </button>`)}
                                        </div>`:o}
                                    ${t===this.items.length-1&&this.loading?this.renderToolSteps():o}
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.tokenUsage?i`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens==null?o:i`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`}
                        ${this.tokenUsage.outputTokens==null?o:i`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`}
                        ${this.tokenUsage.totalTokens==null?o:i`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`}
                    </div>
                `:o}
                ${this.loading?i`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">${this.progressLine()}</span>
                    </div>
                `:o}
                ${this.attachments.length?i`
                    <div class="attachments">
                        ${this.attachments.map(e=>i`
                            <span class="attachment-chip" title="${e.path}">
                                ${w(`vaadin:paperclip`)} ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="${p(`removeNamed`,{name:e.name})}">${w(`vaadin:close-small`)}</button>
                            </span>`)}
                    </div>
                `:o}
                <div class="input-bar">
                    ${this.uploadUrl?i`
                        <button class="mic-btn" title="${m(`attachFiles`)}"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="${m(`attachFiles`)}">${this.uploading?`…`:w(`vaadin:paperclip`)}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    `:o}
                    <button class="mic-btn"
                            title="${L(this.listening)}"
                            aria-label="${L(this.listening)}"
                            aria-keyshortcuts="${F}"
                            aria-pressed="${this.listening?`true`:`false`}"
                            style="color: ${this.listening?`red`:`var(--lumo-contrast-50pct, #767676)`};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${D}</button>
                    <input class="msg-input"
                           placeholder="${h(`placeholder`)}"
                           aria-label="${h(`placeholder`)}"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">${h(`send`)}</button>
                </div>
                <div class="resize-handle ${this.resizing?`resizing`:``}" role="separator"
                     aria-orientation="vertical" tabindex="0" aria-label="${h(`resize`)}"
                     aria-valuemin="${R.min}" aria-valuemax="${R.max}" aria-valuenow="${this.width}"
                     @pointerdown="${this.onResizeStart}" @pointermove="${this.onResizeMove}"
                     @pointerup="${this.onResizeEnd}" @pointercancel="${this.onResizeEnd}"
                     @keydown="${this.onResizeKey}" @dblclick="${this.onResizeReset}"></div>
            </div>
        `}static{this.styles=[E,a`
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
        .chat-header-btn[aria-pressed="true"] {
            color: var(--lumo-primary-text-color, #1676f3);
        }
        /* Follow mode: a "Follow" pill with a robot — outlined when off, filled with the primary
           colour when on. Lumo tokens with neutral fallbacks, like the rest of the
           panel's chrome (neutralChrome.ts). */
        .chat-header-actions > .chat-follow {
            margin-inline-end: var(--lumo-space-xs, .25rem);
        }
        .chat-header-actions > .nbtn.chat-follow {
            height: var(--lumo-size-s, 1.875rem);
            padding: 0 var(--lumo-space-m, .875rem) 0 var(--lumo-space-s, .625rem);
            border: 1px solid var(--lumo-contrast-50pct, rgba(25, 39, 52, .5));
            border-radius: 999px;
            background: transparent;
            color: var(--lumo-body-text-color, #1a1a1a);
            font-weight: 500;
        }
        .chat-header-actions > .nbtn.chat-follow:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .05));
        }
        .chat-header-actions > .nbtn.chat-follow.following {
            border-color: var(--lumo-primary-color, #1676f3);
            background: var(--lumo-primary-color, #1676f3);
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .chat-header-actions > .nbtn.chat-follow.following:hover {
            filter: brightness(1.08);
        }
        .chat-header-actions > .nbtn.chat-follow:focus-visible {
            outline: 2px solid var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
            outline-offset: 2px;
        }
        .chat-header-actions > .nbtn.chat-follow svg {
            width: 1.1em;
            height: 1.1em;
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

        /* Follow mode off: what the agent asked to show, waiting for the user's click. */
        .chat-deferred {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
            margin-top: 0.5rem;
        }
        .chat-deferred-action {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.25rem 0.7rem;
            border: 1px solid var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
            border-radius: 999px;
            background: var(--lumo-primary-color-10pct, rgba(22, 118, 243, .1));
            color: var(--lumo-primary-text-color, #1676f3);
            font: inherit;
            font-size: var(--lumo-font-size-xs, .8125rem);
            cursor: pointer;
            max-width: 100%;
            overflow-wrap: anywhere;
        }
        .chat-deferred-action:hover {
            background: var(--lumo-primary-color-50pct, rgba(22, 118, 243, .2));
        }
        .chat-deferred-action:focus-visible {
            outline: 2px solid var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
            outline-offset: 1px;
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
    `]}};r([n({attribute:!1})],$.prototype,`contextProvider`,void 0),r([n({attribute:!1})],$.prototype,`mcpUrl`,void 0),r([n()],$.prototype,`sseUrl`,void 0),r([n()],$.prototype,`uploadUrl`,void 0),r([n({attribute:!1})],$.prototype,`menu`,void 0),r([t()],$.prototype,`attachments`,void 0),r([t()],$.prototype,`uploading`,void 0),r([C(`.file-input`)],$.prototype,`fileInputElement`,void 0),r([n({type:Boolean,reflect:!0})],$.prototype,`expanded`,void 0),r([t()],$.prototype,`follow`,void 0),r([n()],$.prototype,`followLabel`,void 0),r([n()],$.prototype,`followingLabel`,void 0),r([n()],$.prototype,`label`,void 0),r([n({type:Boolean})],$.prototype,`closable`,void 0),r([t()],$.prototype,`width`,void 0),r([t()],$.prototype,`resizing`,void 0),r([n()],$.prototype,`items`,void 0),r([C(`.scroll-container`)],$.prototype,`scrollContainer`,void 0),r([C(`.msg-input`)],$.prototype,`messageInputElement`,void 0),r([t()],$.prototype,`recognition`,void 0),r([t()],$.prototype,`listening`,void 0),r([t()],$.prototype,`recognitionAvailable`,void 0),r([t()],$.prototype,`loading`,void 0),r([t()],$.prototype,`elapsedSeconds`,void 0),r([t()],$.prototype,`tokenUsage`,void 0),r([t()],$.prototype,`progress`,void 0),r([t()],$.prototype,`progressTick`,void 0),$=r([e(`mateu-chat`)],$);export{$ as MateuChat,Z as chatHeaderButton};