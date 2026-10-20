import{i as e,n as t,r as n,t as r}from"./decorate-D1ynBJn5.js";import{a as i,d as a,n as o,t as s}from"./lit-DSH4rRgP.js";import{t as c}from"./announcer-ipK-856Y.js";import{n as l,r as u}from"./chromeTexts-DuaL_oSO.js";import{c as d,g as f,o as p,s as m}from"./index-DWeXCIfE.js";var h=e=>{let t=Math.max(0,Math.floor(e));return`${Math.floor(t/60)}:${String(t%60).padStart(2,`0`)}`},g=e=>e.length?e.join(`, `):l(`agentAnAgent`),_=class extends s{constructor(...e){super(...e),this.baseUrl=``,this.phase=`loading`,this.code=``,this.secondsLeft=0,this.agents=[],this.copied=!1,this.busy=!1,this.onStatus=e=>{let t=this.paired;this.paired=e.paired,this.agents=e.agents,e.paired?(clearInterval(this.timer),this.phase=`connected`):t===!0&&this.phase===`connected`&&this.close()},this.onKeydown=e=>{e.key===`Escape`&&(e.stopPropagation(),this.close())},this.isPaired=()=>this.phase===`connected`}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.onKeydown),this.unsubscribe=m(this.onStatus),this.phase!==`connected`&&this.requestCode()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.onKeydown),this.unsubscribe?.(),this.unsubscribe=void 0,clearInterval(this.timer),this.focusTrap?.release(),this.focusTrap=void 0}firstUpdated(){let e=this.renderRoot.querySelector(`[role="dialog"]`);e&&(this.focusTrap=f(e))}close(){clearInterval(this.timer),this.focusTrap?.release(),this.focusTrap=void 0,this.remove()}async requestCode(){if(this.app){this.phase=`loading`,clearInterval(this.timer);try{let e=await p(this.app,this.baseUrl,this);if(this.isPaired())return;this.code=e.code,this.secondsLeft=e.expiresInSeconds,this.phase=`code`;let t=Date.now()+e.expiresInSeconds*1e3;this.timer=setInterval(()=>{this.secondsLeft=Math.max(0,Math.round((t-Date.now())/1e3)),this.secondsLeft<=0&&(clearInterval(this.timer),this.phase===`code`&&(this.phase=`expired`))},1e3)}catch{this.isPaired()||(this.phase=`failed`)}this.focusTrap?.refresh()}}async disconnect(){if(this.app&&!this.busy){this.busy=!0;try{await d(this.app,this.baseUrl,this),this.close()}catch{this.busy=!1,c(l(`agentDisconnectFailed`),{politeness:`assertive`})}}}async copy(){try{await navigator.clipboard.writeText(this.code)}catch{}this.copied=!0,c(l(`agentCodeCopied`)),setTimeout(()=>{this.copied=!1},2e3)}renderBody(){switch(this.phase){case`loading`:return i`<p id="agent-connect-desc" role="status">${l(`agentGettingCode`)}</p>`;case`failed`:return i`
                    <p id="agent-connect-desc" role="alert">${l(`agentPairFailed`)}</p>
                    <div class="buttons"><button class="primary" @click="${()=>this.requestCode()}">${l(`retry`)}</button></div>`;case`expired`:return i`
                    <p id="agent-connect-desc">${l(`agentCodeExpired`)}</p>
                    <div class="buttons"><button class="primary" @click="${()=>this.requestCode()}">${l(`agentNewCode`)}</button></div>`;case`code`:return i`
                    <p id="agent-connect-desc">${l(`agentPairInstruction`)}</p>
                    <div class="code">${this.code}</div>
                    <p class="countdown" aria-live="off">${u(`agentCodeExpiresIn`,{time:h(this.secondsLeft)})}</p>
                    <div class="buttons">
                        <button class="primary copy" @click="${()=>this.copy()}">${this.copied?l(`agentCodeCopied`):l(`agentCopyCode`)}</button>
                    </div>`;case`connected`:return i`
                    <p id="agent-connect-desc" class="connected"><span class="dot" aria-hidden="true"></span>${u(`agentConnectedTo`,{agents:g(this.agents)})}</p>
                    <div class="buttons">
                        <button class="danger disconnect" ?disabled="${this.busy}" @click="${()=>this.disconnect()}">${l(`agentDisconnect`)}</button>
                    </div>`}}render(){return i`
            <div class="backdrop" @click="${()=>this.close()}"></div>
            <div class="panel" role="dialog" aria-modal="true" aria-labelledby="agent-connect-title" aria-describedby="agent-connect-desc">
                <h2 id="agent-connect-title">${l(`agentDialogTitle`)}</h2>
                <button class="close" @click="${()=>this.close()}" aria-label="${l(`close`)}"
                        title="${l(`close`)}">✕</button>
                ${this.renderBody()??o}
            </div>`}static{this.styles=a`
        :host { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; }
        .backdrop { position: absolute; inset: 0; background: var(--lumo-shade-50pct, rgba(0, 0, 0, .5)); }
        .panel {
            position: relative; box-sizing: border-box; width: min(26rem, calc(100vw - 2 * var(--lumo-space-m, 1rem)));
            max-height: calc(100vh - 2 * var(--lumo-space-m, 1rem)); overflow: auto;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: var(--lumo-border-radius-l, 12px); box-shadow: var(--lumo-box-shadow-xl, 0 8px 32px rgba(0, 0, 0, .3));
            padding: var(--lumo-space-l, 1.5rem); display: flex; flex-direction: column; gap: var(--lumo-space-m, 1rem);
            font-family: var(--lumo-font-family, system-ui, sans-serif);
        }
        h2 { margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); line-height: var(--lumo-line-height-xs, 1.25); padding-right: var(--lumo-space-xl, 2.5rem); }
        .close {
            position: absolute; top: var(--lumo-space-s, .5rem); right: var(--lumo-space-s, .5rem);
            width: var(--lumo-size-m, 2.25rem); height: var(--lumo-size-m, 2.25rem); border: none; background: transparent;
            color: var(--lumo-secondary-text-color, #555); font: inherit; font-size: var(--lumo-font-size-l, 1.125rem);
            border-radius: var(--lumo-border-radius-m, 8px); cursor: pointer;
        }
        p { margin: 0; color: var(--lumo-secondary-text-color, #555); font-size: var(--lumo-font-size-s, .875rem); line-height: var(--lumo-line-height-s, 1.375); }
        .code {
            align-self: center; user-select: all; font-family: var(--lumo-font-family-monospace, ui-monospace, monospace);
            font-size: var(--lumo-font-size-xxxl, 2.5rem); font-weight: 600; letter-spacing: .08em;
            padding: var(--lumo-space-s, .5rem) var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-m, 8px);
            background: var(--lumo-contrast-5pct, #f4f4f4); color: var(--lumo-body-text-color, #1a1a1a);
        }
        .countdown { text-align: center; }
        .connected { display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); color: var(--lumo-body-text-color, #1a1a1a); font-size: var(--lumo-font-size-m, 1rem); }
        .dot { width: .6rem; height: .6rem; border-radius: 50%; background: var(--lumo-success-color, #1e8e3e); flex-shrink: 0; }
        .buttons { display: flex; justify-content: flex-end; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; }
        .buttons button {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600; cursor: pointer;
            padding: var(--lumo-space-xs, .25rem) var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-m, 8px); border: none;
        }
        .primary { background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); }
        .danger { background: var(--lumo-error-color, #d32f2f); color: var(--lumo-error-contrast-color, #fff); }
        button[disabled] { opacity: .6; cursor: default; }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, #1676f3); outline-offset: 2px; }
    `}};r([n({attribute:!1})],_.prototype,`app`,void 0),r([n()],_.prototype,`baseUrl`,void 0),r([t()],_.prototype,`phase`,void 0),r([t()],_.prototype,`code`,void 0),r([t()],_.prototype,`secondsLeft`,void 0),r([t()],_.prototype,`agents`,void 0),r([t()],_.prototype,`copied`,void 0),r([t()],_.prototype,`busy`,void 0),_=r([e(`mateu-agent-connect-dialog`)],_);var v=e=>{document.querySelectorAll(`mateu-agent-connect-dialog`).forEach(e=>e.close());let t=document.createElement(`mateu-agent-connect-dialog`);return t.app=e.app,t.baseUrl=e.baseUrl??``,document.body.appendChild(t),t};export{v as openAgentConnectDialog};