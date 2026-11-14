
import{T as e,i as t,k as n,o as r,x as i}from"./vendor-lit.js";import{r as a}from"./chromeTexts.js";import{S as o,U as s,z as c}from"./mateu-vaadin.js";var l=class extends i{constructor(...e){super(...e),this.stopping=!1}async stop(){if(!this.stopping){this.stopping=!0;try{await o()}finally{this.stopping=!1}}}render(){return e`
            <div class="notice" role="status">
                <span class="dot" aria-hidden="true"></span>
                <span class="text">${a(`agentOperating`)}</span>
                <button class="stop" ?disabled="${this.stopping}" @click="${()=>{this.stop()}}">${a(`agentStop`)}</button>
            </div>`}static{this.styles=n`
        :host {
            position: fixed; left: 50%; transform: translateX(-50%);
            bottom: max(1rem, env(safe-area-inset-bottom)); z-index: 1000;
            max-width: calc(100vw - 2rem);
        }
        .notice {
            display: flex; align-items: center; gap: .6rem;
            padding: .45rem .55rem .45rem .8rem;
            background: var(--lumo-warning-color-10pct, #fff4d6); color: var(--lumo-body-text-color, #1a1a1a);
            border: 1px solid var(--lumo-warning-color-50pct, #e0b84c); border-radius: var(--lumo-border-radius-l, .5rem);
            box-shadow: var(--lumo-box-shadow-s, 0 2px 6px rgba(0, 0, 0, .15));
            font: inherit; font-size: var(--lumo-font-size-s, .875rem);
        }
        .dot { width: .55rem; height: .55rem; border-radius: 50%; background: var(--lumo-warning-color, #c47f00); flex-shrink: 0;
            animation: pulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
        @keyframes pulse { 50% { opacity: .35; } }
        .text { overflow: hidden; text-overflow: ellipsis; }
        .stop {
            font: inherit; font-weight: 600; cursor: pointer; flex-shrink: 0; min-height: 24px;
            color: var(--lumo-body-text-color, #1a1a1a); background: transparent; border: 1px solid var(--lumo-warning-text-color, #8a6a1f);
            border-radius: var(--lumo-border-radius-m, .25rem); padding: .15rem .6rem;
        }
        .stop:hover { background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .06)); }
        ${c}
    `}};s([t()],l.prototype,`stopping`,void 0),l=s([r(`mateu-agent-operating`)],l);