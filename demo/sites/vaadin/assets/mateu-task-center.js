
import{S as e,T as t,i as n,k as r,o as i,x as a}from"./vendor-lit.js";import{A as o,_ as s,d as c,en as l,f as u,g as d,h as f,l as p,m,o as h,p as g,q as _,r as v,u as y,v as b,y as x}from"./globalCommands.js";import{i as S,r as C}from"./chromeTexts.js";import{t as w}from"./dirtyGuard.js";import{F as T,H as E,U as D,_ as O,g as k,h as A,z as j}from"./mateu-vaadin.js";var M=`_progress-cancel`,N=async e=>{let t=s.find(e);if(!t)return;let n=t.origin??{};try{let t=await _.runAction(n.baseUrl??``,n.route||`_no_route`,``,M,`mateu-task-center`,void 0,n.serverSideType??``,{},{taskId:e},n.initiator??document.body,!0);for(let e of t?.commands??[])v(e,n)}catch{l({text:C(`taskCancelFailed`),variant:`error`},document.body)}},P=e=>{let t=s.find(e);t?.origin?.retry&&(s.dismiss(e),t.origin.retry())},F=(e,t)=>{let n=s.find(e)?.origin?.initiator;if(n?.isConnected)return x(t,n);if(t.route){let e=h();return!e||!w.confirmLeave()?!1:(o(e,t.route),!0)}return console.debug?.(`mateu: the screen that started the task is gone; its action cannot run there`,t.actionId),!1},I=(e,t)=>{if(typeof e!=`number`||!Number.isFinite(e)||e<=0)return null;if(e<60)return C(`taskEtaUnderMinute`,t);if(e<3600){let n=Math.max(1,Math.round(e/60));if(n<60)return S(`taskEtaMinutes`,{n},t)}return S(`taskEtaHours`,{n:Math.max(1,Math.round(e/3600))},t)},L=class extends a{constructor(...e){super(...e),this.tasks=s.state,this.listOpen=!1,this.now=Date.now(),this.announced=new Map}connectedCallback(){super.connectedCallback(),this.unsubscribe=s.subscribe(e=>this.onTasks(e)),this.onTasks(s.state),this.unsubscribeOs=k(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),this.unsubscribe=void 0,this.unsubscribeOs?.(),this.unsubscribeOs=void 0,clearInterval(this.ticker),this.ticker=void 0,clearTimeout(this.closer),this.releaseTrap()}onTasks(e){this.tasks=e,this.now=Date.now();for(let t of e.entries)this.announceChange(t);let t=y(e).running>0;t&&!this.ticker?this.ticker=setInterval(()=>{this.now=Date.now()},1e3):!t&&this.ticker&&(clearInterval(this.ticker),this.ticker=void 0),this.scheduleAutoClose()}announceChange(e){let t=e.progress.taskId,n=e.progress.state??`running`;if(this.announced.get(t)===n)return;this.announced.set(t,n);let r=e.progress.title||C(`tasks`);E(S(n===`running`?`taskStarted`:n===`done`?`taskFinishedAnnounce`:n===`failed`?`taskFailedAnnounce`:`taskCancelledAnnounce`,{title:r}),{politeness:`polite`})}scheduleAutoClose(){clearTimeout(this.closer);let e=this.tasks.entries.filter(e=>e.progress.blocking&&g(e.progress)&&e.finishedAt!==void 0&&(e.progress.closeAfterSeconds??0)>0).map(e=>e.finishedAt+e.progress.closeAfterSeconds*1e3-Date.now()).filter(e=>e>0);e.length>0&&(this.closer=setTimeout(()=>{this.now=Date.now(),this.scheduleAutoClose()},Math.min(...e)+20))}updated(e){let t=p(this.tasks,this.now),n=this.renderRoot.querySelector(`.modal`);t&&n?this.trappedTask===t.progress.taskId?this.trap?.refresh():(this.releaseTrap(),this.trappedTask=t.progress.taskId,this.trap=T(n)):this.releaseTrap()}releaseTrap(){this.trap?.release(),this.trap=void 0,this.trappedTask=void 0}stateLabel(e){switch(e.progress.state){case`done`:return C(`taskDone`);case`failed`:return C(`taskFailed`);case`cancelled`:return C(`taskCancelled`);default:return C(`taskRunning`)}}renderBar(n){let r=n.progress,i=f(r),a=g(r)&&i===void 0?100:i,o=d(r),s=[r.text,o?S(`taskStepCount`,o):null].filter(Boolean).join(` · `);return t`
            <div class="bar ${a===void 0?`bar--indeterminate`:``} bar--${r.state??`running`}"
                 role="progressbar" aria-label="${r.title||C(`progress`)}"
                 aria-valuemin="0" aria-valuemax="100"
                 aria-valuenow="${a===void 0?e:a}"
                 aria-valuetext="${s||e}">
                <div class="bar-fill" style="${a===void 0?``:`width: ${a}%`}"></div>
            </div>`}renderMeta(n){let r=d(n.progress),i=g(n.progress)?null:I(n.progress.etaSeconds);return t`
            <div class="meta">
                ${r?t`<span>${S(`taskStepCount`,r)}</span>`:e}
                <span>${S(`taskElapsed`,{time:u(c(n,this.now))})}</span>
                ${i?t`<span class="eta">${i}</span>`:e}
                <span class="state state--${n.progress.state??`running`}">${this.stateLabel(n)}</span>
            </div>`}renderButtons(n,r){let i=n.progress,a=i.taskId;return g(i)?t`
            <div class="buttons">
                ${(i.resultActions??[]).map((e,n)=>t`
                    <button class="btn ${n===0||e.style===`primary`?`btn--primary`:``}"
                            @click="${()=>{F(a,e)&&s.dismiss(a)}}">${b(e)}</button>`)}
                ${i.state===`failed`&&i.retryable&&n.origin?.retry?t`
                    <button class="btn btn--primary" @click="${()=>P(a)}">${C(`retry`)}</button>`:e}
                <button class="btn" @click="${()=>s.dismiss(a)}">${C(r?`close`:`dismiss`)}</button>
            </div>`:t`
                <div class="buttons">
                    ${r&&i.backgroundable?t`
                        <button class="btn" @click="${()=>s.moveToBackground(a)}">${C(`taskBackground`)}</button>`:e}
                    ${i.cancellable?t`
                        <button class="btn" @click="${()=>void N(a)}">${C(`cancel`)}</button>`:e}
                </div>`}renderTask(n,r){let i=n.progress;return t`
            <div class="task task--${i.state??`running`}">
                <div class="task-title" id="${r?`mateu-task-title`:e}">${i.title}</div>
                ${i.text?t`<div class="task-text">${i.text}</div>`:e}
                ${i.state===`failed`&&i.error?t`<div class="task-error" role="alert">${i.error}</div>`:e}
                ${this.renderBar(n)}
                ${this.renderMeta(n)}
                ${this.renderButtons(n,r)}
            </div>`}renderModal(e){return t`
            <div class="backdrop"></div>
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mateu-task-title" tabindex="-1">
                ${this.renderTask(e,!0)}
            </div>`}renderList(n){return t`
            <div class="list" role="region" aria-label="${C(`tasks`)}">
                <div class="list-head">
                    <span class="list-title">${C(`tasks`)}</span>
                    ${y(this.tasks).finished>0?t`
                        <button class="link" @click="${()=>s.clearFinished()}">${C(`tasksClearFinished`)}</button>`:e}
                    <button class="icon" aria-label="${C(`close`)}" @click="${()=>{this.listOpen=!1}}">✕</button>
                </div>
                ${n.length===0?t`<div class="empty">${C(`tasksNone`)}</div>`:e}
                ${n.map(e=>this.renderTask(e,!1))}
                ${A()?t`
                    <button class="link os-notify" @click="${()=>void O()}">${C(`osNotificationsEnable`)}</button>`:e}
            </div>`}render(){let n=p(this.tasks,this.now),r=m(this.tasks).filter(e=>e!==n),i=y(this.tasks),a=r.length>0;return t`
            ${n?this.renderModal(n):e}
            ${a?t`
                <div class="dock">
                    ${this.listOpen?this.renderList(r):e}
                    <button class="indicator ${i.failed>0?`indicator--failed`:``}"
                            aria-expanded="${this.listOpen?`true`:`false`}"
                            aria-label="${i.running>0?S(`tasksShow`,{count:i.running}):C(`tasksShowIdle`)}"
                            @click="${()=>{this.listOpen=!this.listOpen}}">
                        <span class="spinner ${i.running>0?`spinner--on`:``}" aria-hidden="true"></span>
                        <span>${i.running>0?S(`tasksRunning`,{count:i.running}):C(`tasks`)}</span>
                    </button>
                </div>`:e}`}static{this.styles=r`
        :host { position: static; }
        .backdrop {
            position: fixed; inset: 0; z-index: 1900;
            background: var(--lumo-shade-20pct, rgba(0, 0, 0, 0.25));
        }
        .modal {
            position: fixed; z-index: 1901; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: min(28rem, calc(100vw - 2rem)); box-sizing: border-box;
            padding: var(--lumo-space-l, 1.5rem);
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: var(--lumo-border-radius-l, 8px);
            box-shadow: var(--lumo-box-shadow-l, 0 8px 32px rgba(0, 0, 0, 0.25));
            outline: none;
        }
        .modal .task-title { font-size: var(--lumo-font-size-l, 1.125rem); }
        .dock {
            position: fixed; z-index: 940;
            left: var(--lumo-space-m, 1rem); bottom: var(--lumo-space-m, 1rem);
            display: flex; flex-direction: column; align-items: flex-start; gap: var(--lumo-space-s, 0.5rem);
        }
        .indicator {
            display: inline-flex; align-items: center; gap: 0.5rem;
            font: inherit; font-size: var(--lumo-font-size-s, 0.875rem);
            padding: 0.45rem 0.85rem; border-radius: 999px; cursor: pointer;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0, 0, 0, 0.15));
        }
        .indicator--failed { border-color: var(--lumo-error-color, #c62828); }
        .spinner {
            width: 0.85rem; height: 0.85rem; border-radius: 50%;
            border: 2px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
        }
        .spinner--on {
            border-top-color: var(--lumo-primary-color, #1565c0);
            animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .list {
            width: min(24rem, calc(100vw - 2rem)); max-height: min(28rem, 70vh); overflow-y: auto;
            box-sizing: border-box; padding: var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem);
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
            border-radius: var(--lumo-border-radius-l, 8px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0, 0, 0, 0.2));
        }
        .list-head { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; }
        .list-title { flex: 1; font-weight: 600; }
        .list .task { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08)); padding: 0.6rem 0; }
        .empty { padding: 0.75rem 0; color: var(--lumo-secondary-text-color, #5f6b7a); }
        .task { display: flex; flex-direction: column; gap: 0.35rem; }
        .task-title { font-weight: 600; }
        .task-text { font-size: var(--lumo-font-size-s, 0.875rem); }
        .task-error { font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-error-text-color, #c62828); }
        .bar {
            position: relative; height: 0.4rem; overflow: hidden; border-radius: 999px;
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
        }
        .bar-fill {
            height: 100%; width: 0; border-radius: inherit;
            background: var(--lumo-primary-color, #1565c0); transition: width 0.3s ease;
        }
        .bar--done .bar-fill { background: var(--lumo-success-color, #2e7d32); }
        .bar--failed .bar-fill { background: var(--lumo-error-color, #c62828); }
        .bar--cancelled .bar-fill { background: var(--lumo-contrast-50pct, #888); }
        .bar--indeterminate .bar-fill { width: 35%; animation: slide 1.4s ease-in-out infinite; }
        @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        @media (prefers-reduced-motion: reduce) {
            .bar--indeterminate .bar-fill, .spinner--on { animation: none; }
        }
        .meta {
            display: flex; flex-wrap: wrap; gap: 0.75rem;
            font-size: var(--lumo-font-size-xs, 0.75rem); color: var(--lumo-secondary-text-color, #5f6b7a);
        }
        .state { margin-left: auto; }
        .state--failed { color: var(--lumo-error-text-color, #c62828); }
        .state--done { color: var(--lumo-success-text-color, #2e7d32); }
        .buttons { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
        .btn, .link, .icon {
            font: inherit; font-size: var(--lumo-font-size-s, 0.875rem); cursor: pointer;
            border-radius: var(--lumo-border-radius-m, 4px);
        }
        .btn {
            padding: 0.3rem 0.8rem; background: transparent;
            color: var(--lumo-primary-text-color, #1565c0);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.2));
        }
        .btn--primary {
            background: var(--lumo-primary-color, #1565c0); color: var(--lumo-primary-contrast-color, #fff);
            border-color: transparent;
        }
        .link { background: none; border: none; color: var(--lumo-primary-text-color, #1565c0); padding: 0.2rem; }
        .icon { background: none; border: none; color: inherit; padding: 0.2rem 0.4rem; }
        ${j}
    `}};D([n()],L.prototype,`tasks`,void 0),D([n()],L.prototype,`listOpen`,void 0),D([n()],L.prototype,`now`,void 0),L=D([i(`mateu-task-center`)],L);export{L as MateuTaskCenter};