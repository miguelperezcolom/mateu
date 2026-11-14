
import{S as e,T as t,i as n,k as r,o as i,x as a}from"./vendor-lit.js";import{r as o}from"./chromeTexts.js";import{t as s}from"./dirtyGuard.js";import{f as c,m as l,n as u,nt as d,p as f,t as p}from"./mateu-vaadin.js";var m,h=class extends a{static{m=this}constructor(...e){super(...e),this.shown=!1,this.signOut=()=>{s.confirmLeave()&&p()}}static{this.SETTLE_MS=1500}connectedCallback(){super.connectedCallback(),this.unsubscribe=f(()=>this.decide()),this.decide()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),clearTimeout(this.timer)}decide(){clearTimeout(this.timer),l(u(),c())?this.timer=setTimeout(()=>{this.shown=l(u(),c())},m.SETTLE_MS):this.shown=!1}static{this.styles=r`
        :host { position: fixed; left: 1rem; bottom: 1rem; z-index: 1000; }
        button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1f2a37);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.2));
            border-radius: var(--lumo-border-radius-l, 0.75rem);
            padding: 0.4rem 0.9rem;
            min-height: 2.25rem;
            cursor: pointer;
            box-shadow: var(--lumo-box-shadow-xs, 0 1px 3px rgba(0, 0, 0, 0.12));
        }
        button:hover { background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.05)); }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, #1a73e8); outline-offset: 2px; }
    `}render(){return this.shown?t`<button class="mateu-sign-out" @click="${this.signOut}">${o(`signOut`)}</button>`:e}};d([n()],h.prototype,`shown`,void 0),h=m=d([i(`mateu-sign-out-corner`)],h);var g=null,_=()=>{g?.isConnected||(g=document.createElement(`mateu-sign-out-corner`),document.body.appendChild(g))};export{_ as mountSignOutCorner};