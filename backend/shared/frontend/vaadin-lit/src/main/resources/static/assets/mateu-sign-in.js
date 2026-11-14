
import{E as e,S as t,T as n,a as r,k as i,o as a,x as o}from"./vendor-lit.js";import{i as s,r as c}from"./chromeTexts.js";import{F as l,H as u,U as d,a as f}from"./mateu-vaadin.js";var p=class extends o{constructor(...e){super(...e),this.providers=[],this.cancellable=!1,this.onKeydown=e=>{e.key===`Escape`&&this.cancellable&&(e.preventDefault(),this.cancel())}}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.onKeydown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.onKeydown),this.trap?.release(),this.trap=void 0}firstUpdated(){let e=this.renderRoot.querySelector(`[role="dialog"]`);e&&(this.trap=l(e,{initialFocus:()=>this.renderRoot.querySelector(`button.provider`)})),this.message&&u(this.message,{politeness:`assertive`})}select(e){this.dispatchEvent(new CustomEvent(`mateu-sign-in-selected`,{detail:{provider:e},bubbles:!0,composed:!0}))}cancel(){this.dispatchEvent(new CustomEvent(`mateu-sign-in-cancelled`,{bubbles:!0,composed:!0}))}glyph(t){let r=f(t);return r?n`<span class="glyph" aria-hidden="true">${r}</span>`:n`<span class="glyph" aria-hidden="true">${e`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15 19 4M18 5l2 2M15 8l2 2"/></svg>`}</span>`}render(){return n`
            <div class="page">
                <div class="panel" role="dialog" aria-modal="true" aria-labelledby="mateu-sign-in-title">
                    <h1 id="mateu-sign-in-title">${c(`signInTitle`)}</h1>
                    ${this.message?n`<p class="message" role="alert">${this.message}</p>`:n`<p class="hint">${c(this.providers.length>1?`signInChoose`:`signInHint`)}</p>`}
                    <ul class="providers">
                        ${this.providers.map(e=>n`
                            <li><button class="provider" type="button" data-provider="${e.id}"
                                        @click="${()=>this.select(e)}">${this.glyph(e)}<span class="label">${s(`signInWith`,{provider:e.label})}</span></button></li>`)}
                    </ul>
                    ${this.cancellable?n`<button class="cancel" type="button" @click="${()=>this.cancel()}">${c(`cancel`)}</button>`:t}
                </div>
            </div>`}static{this.styles=i`
        :host {
            position: fixed;
            inset: 0;
            z-index: 2147483000;
            display: block;
            font-family: var(--lumo-font-family, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif);
            color: var(--lumo-body-text-color, #1f2328);
        }
        .page {
            box-sizing: border-box;
            min-height: 100%;
            height: 100%;
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--lumo-space-m, 16px);
            background: var(--lumo-contrast-5pct, #f3f4f6);
        }
        .panel {
            box-sizing: border-box;
            width: 100%;
            max-width: 26rem;
            padding: var(--lumo-space-xl, 32px) var(--lumo-space-l, 28px);
            border-radius: 12px;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, #e5e7eb);
            box-shadow: var(--lumo-box-shadow-m, 0 8px 24px rgba(0, 0, 0, 0.08));
        }
        h1 { margin: 0 0 var(--lumo-space-s, 8px); font-size: var(--lumo-font-size-xl, 1.5rem); font-weight: 600; }
        .hint { margin: 0 0 var(--lumo-space-l, 24px); color: var(--lumo-secondary-text-color, #57606a); }
        .message {
            margin: 0 0 var(--lumo-space-l, 24px); padding: var(--lumo-space-s, 10px) var(--lumo-space-m, 12px); border-radius: 8px;
            background: var(--lumo-error-color-10pct, #fdecea); color: var(--lumo-error-text-color, #7a1c14);
        }
        .providers { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--lumo-space-s, 10px); }
        button { font: inherit; cursor: pointer; }
        .provider {
            width: 100%;
            display: flex;
            align-items: center;
            gap: var(--lumo-space-m, 12px);
            min-height: 44px;
            padding: var(--lumo-space-s, 8px) var(--lumo-space-m, 14px);
            border-radius: 8px;
            border: 1px solid var(--lumo-contrast-30pct, #c4c9d0);
            background: var(--lumo-base-color, #fff);
            color: inherit;
            text-align: start;
        }
        .provider:hover { background: var(--lumo-contrast-5pct, #f3f4f6); }
        .provider:focus-visible, .cancel:focus-visible {
            outline: 3px solid var(--lumo-primary-color-50pct, #2563eb80);
            outline-offset: 2px;
        }
        .glyph {
            flex: 0 0 28px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: var(--lumo-font-size-s, 0.875rem);
            background: var(--lumo-contrast-10pct, #e8eaed);
            color: var(--lumo-body-text-color, #1f2328);
        }
        .label { flex: 1; }
        .cancel {
            margin-top: var(--lumo-space-l, 20px);
            padding: var(--lumo-space-s, 8px) var(--lumo-space-xs, 4px);
            border: none;
            background: none;
            color: var(--lumo-primary-text-color, #1d4ed8);
        }
    `}};d([r({attribute:!1})],p.prototype,`providers`,void 0),d([r()],p.prototype,`message`,void 0),d([r({type:Boolean})],p.prototype,`cancellable`,void 0),p=d([a(`mateu-sign-in`)],p);var m=e=>new Promise(t=>{document.querySelectorAll(`mateu-sign-in`).forEach(e=>e.remove());let n=document.createElement(`mateu-sign-in`);n.providers=e.providers,n.message=e.message,n.cancellable=e.cancellable;let r=e=>{n.remove(),t(e)};n.addEventListener(`mateu-sign-in-selected`,e=>r(e.detail.provider)),n.addEventListener(`mateu-sign-in-cancelled`,()=>r(null)),document.body.appendChild(n)});export{m as showSignInChooser};