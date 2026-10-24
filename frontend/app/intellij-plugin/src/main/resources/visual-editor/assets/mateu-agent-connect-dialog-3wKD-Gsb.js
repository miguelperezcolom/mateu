import{a as e,n as t,p as n,t as r}from"./lit-Ca8Nedot.js";import{At as i,Bt as a,Nt as o,Ot as s,Rt as c,S as l,a as u,i as d,kt as f,o as p,zt as m}from"./index-CyMt57GS.js";var h=e=>{let t=Math.max(0,Math.floor(e));return`${Math.floor(t/60)}:${String(t%60).padStart(2,`0`)}`},g=e=>e.length?e.join(`, `):s(`agentAnAgent`),_=class extends r{constructor(...e){super(...e),this.baseUrl=``,this.phase=`loading`,this.code=``,this.secondsLeft=0,this.agents=[],this.copied=!1,this.busy=!1,this.onStatus=e=>{let t=this.paired;this.paired=e.paired,this.agents=e.agents,e.paired?(clearInterval(this.timer),this.phase=`connected`):t===!0&&this.phase===`connected`&&this.close()},this.onKeydown=e=>{e.key===`Escape`&&(e.stopPropagation(),this.close())},this.isPaired=()=>this.phase===`connected`}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.onKeydown),this.unsubscribe=u(this.onStatus),this.phase!==`connected`&&this.requestCode()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.onKeydown),this.unsubscribe?.(),this.unsubscribe=void 0,clearInterval(this.timer),this.focusTrap?.release(),this.focusTrap=void 0}firstUpdated(){let e=this.renderRoot.querySelector(`[role="dialog"]`);e&&(this.focusTrap=l(e))}close(){clearInterval(this.timer),this.focusTrap?.release(),this.focusTrap=void 0,this.remove()}async requestCode(){if(this.app){this.phase=`loading`,clearInterval(this.timer);try{let e=await d(this.app,this.baseUrl,this);if(this.isPaired())return;this.code=e.code,this.secondsLeft=e.expiresInSeconds,this.phase=`code`;let t=Date.now()+e.expiresInSeconds*1e3;this.timer=setInterval(()=>{this.secondsLeft=Math.max(0,Math.round((t-Date.now())/1e3)),this.secondsLeft<=0&&(clearInterval(this.timer),this.phase===`code`&&(this.phase=`expired`))},1e3)}catch{this.isPaired()||(this.phase=`failed`)}this.focusTrap?.refresh()}}async disconnect(){if(!(!this.app||this.busy)){this.busy=!0;try{await p(this.app,this.baseUrl,this),this.close()}catch{this.busy=!1,i(s(`agentDisconnectFailed`),{politeness:`assertive`})}}}async copy(){try{await navigator.clipboard.writeText(this.code)}catch{}this.copied=!0,i(s(`agentCodeCopied`)),setTimeout(()=>{this.copied=!1},2e3)}renderBody(){switch(this.phase){case`loading`:return e`<p id="agent-connect-desc" role="status">${s(`agentGettingCode`)}</p>`;case`failed`:return e`
                    <p id="agent-connect-desc" role="alert">${s(`agentPairFailed`)}</p>
                    <div class="buttons"><button class="primary" @click="${()=>this.requestCode()}">${s(`retry`)}</button></div>`;case`expired`:return e`
                    <p id="agent-connect-desc">${s(`agentCodeExpired`)}</p>
                    <div class="buttons"><button class="primary" @click="${()=>this.requestCode()}">${s(`agentNewCode`)}</button></div>`;case`code`:return e`
                    <p id="agent-connect-desc">${s(`agentPairInstruction`)}</p>
                    <div class="code">${this.code}</div>
                    <p class="countdown" aria-live="off">${f(`agentCodeExpiresIn`,{time:h(this.secondsLeft)})}</p>
                    <div class="buttons">
                        <button class="primary copy" @click="${()=>this.copy()}">${this.copied?s(`agentCodeCopied`):s(`agentCopyCode`)}</button>
                    </div>`;case`connected`:return e`
                    <p id="agent-connect-desc" class="connected"><span class="dot" aria-hidden="true"></span>${f(`agentConnectedTo`,{agents:g(this.agents)})}</p>
                    <div class="buttons">
                        <button class="danger disconnect" ?disabled="${this.busy}" @click="${()=>this.disconnect()}">${s(`agentDisconnect`)}</button>
                    </div>`}}render(){return e`
            <div class="backdrop" @click="${()=>this.close()}"></div>
            <div class="panel" role="dialog" aria-modal="true" aria-labelledby="agent-connect-title" aria-describedby="agent-connect-desc">
                <h2 id="agent-connect-title">${s(`agentDialogTitle`)}</h2>
                <button class="close" @click="${()=>this.close()}" aria-label="${s(`close`)}"
                        title="${s(`close`)}">✕</button>
                ${this.renderBody()??t}
            </div>`}static{this.styles=n`
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
    `}};o([m({attribute:!1})],_.prototype,`app`,void 0),o([m()],_.prototype,`baseUrl`,void 0),o([c()],_.prototype,`phase`,void 0),o([c()],_.prototype,`code`,void 0),o([c()],_.prototype,`secondsLeft`,void 0),o([c()],_.prototype,`agents`,void 0),o([c()],_.prototype,`copied`,void 0),o([c()],_.prototype,`busy`,void 0),_=o([a(`mateu-agent-connect-dialog`)],_);var v=e=>{document.querySelectorAll(`mateu-agent-connect-dialog`).forEach(e=>e.close());let t=document.createElement(`mateu-agent-connect-dialog`);return t.app=e.app,t.baseUrl=e.baseUrl??``,document.body.appendChild(t),t};export{v as openAgentConnectDialog};