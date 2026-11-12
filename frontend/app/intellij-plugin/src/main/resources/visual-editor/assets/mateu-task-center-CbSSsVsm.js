import{i as e,n as t,t as n}from"./decorate-D1ynBJn5.js";import{a as r,d as i,n as a,t as o}from"./lit-DSH4rRgP.js";import{G as s,_ as c,i as l,y as u}from"./rowRoute-D0vXkyYy.js";import{t as d}from"./announcer-VIHrbQlQ.js";import{i as f,r as p}from"./chromeTexts-H3kF_lzN.js";import{_ as m,c as h,d as g,f as _,g as v,h as y,l as b,m as x,o as S,p as C,r as w,u as T,v as E}from"./globalCommands--cFmE2zp.js";import{A as D,bt as O,d as k,f as A,p as j}from"./index-D2EJW55F.js";var M=`_progress-cancel`,N=async e=>{let t=v.find(e);if(!t)return;let n=t.origin??{};try{let t=await u.runAction(n.baseUrl??``,n.route||`_no_route`,``,M,`mateu-task-center`,void 0,n.serverSideType??``,{},{taskId:e},n.initiator??document.body,!0);for(let e of t?.commands??[])w(e,n)}catch{s({text:p(`taskCancelFailed`),variant:`error`},document.body)}},P=e=>{let t=v.find(e);t?.origin?.retry&&(v.dismiss(e),t.origin.retry())},F=(e,t)=>{let n=v.find(e)?.origin?.initiator;if(n?.isConnected)return E(t,n);if(t.route){let e=S();return!e||!c.confirmLeave()?!1:(l(e,t.route),!0)}return console.debug?.(`mateu: the screen that started the task is gone; its action cannot run there`,t.actionId),!1},I=(e,t)=>{if(typeof e!=`number`||!Number.isFinite(e)||e<=0)return null;if(e<60)return p(`taskEtaUnderMinute`,t);if(e<3600){let n=Math.max(1,Math.round(e/60));if(n<60)return f(`taskEtaMinutes`,{n},t)}return f(`taskEtaHours`,{n:Math.max(1,Math.round(e/3600))},t)},L=class extends o{constructor(...e){super(...e),this.tasks=v.state,this.listOpen=!1,this.now=Date.now(),this.announced=new Map}connectedCallback(){super.connectedCallback(),this.unsubscribe=v.subscribe(e=>this.onTasks(e)),this.onTasks(v.state),this.unsubscribeOs=A(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),this.unsubscribe=void 0,this.unsubscribeOs?.(),this.unsubscribeOs=void 0,clearInterval(this.ticker),this.ticker=void 0,clearTimeout(this.closer),this.releaseTrap()}onTasks(e){this.tasks=e,this.now=Date.now();for(let t of e.entries)this.announceChange(t);let t=b(e).running>0;t&&!this.ticker?this.ticker=setInterval(()=>{this.now=Date.now()},1e3):!t&&this.ticker&&(clearInterval(this.ticker),this.ticker=void 0),this.scheduleAutoClose()}announceChange(e){let t=e.progress.taskId,n=e.progress.state??`running`;if(this.announced.get(t)===n)return;this.announced.set(t,n);let r=e.progress.title||p(`tasks`);d(f(n===`running`?`taskStarted`:n===`done`?`taskFinishedAnnounce`:n===`failed`?`taskFailedAnnounce`:`taskCancelledAnnounce`,{title:r}),{politeness:`polite`})}scheduleAutoClose(){clearTimeout(this.closer);let e=this.tasks.entries.filter(e=>e.progress.blocking&&_(e.progress)&&e.finishedAt!==void 0&&(e.progress.closeAfterSeconds??0)>0).map(e=>e.finishedAt+e.progress.closeAfterSeconds*1e3-Date.now()).filter(e=>e>0);e.length>0&&(this.closer=setTimeout(()=>{this.now=Date.now(),this.scheduleAutoClose()},Math.min(...e)+20))}updated(e){let t=h(this.tasks,this.now),n=this.renderRoot.querySelector(`.modal`);t&&n?this.trappedTask===t.progress.taskId?this.trap?.refresh():(this.releaseTrap(),this.trappedTask=t.progress.taskId,this.trap=D(n)):this.releaseTrap()}releaseTrap(){this.trap?.release(),this.trap=void 0,this.trappedTask=void 0}stateLabel(e){switch(e.progress.state){case`done`:return p(`taskDone`);case`failed`:return p(`taskFailed`);case`cancelled`:return p(`taskCancelled`);default:return p(`taskRunning`)}}renderBar(e){let t=e.progress,n=x(t),i=_(t)&&n===void 0?100:n,o=y(t),s=[t.text,o?f(`taskStepCount`,o):null].filter(Boolean).join(` · `);return r`
            <div class="bar ${i===void 0?`bar--indeterminate`:``} bar--${t.state??`running`}"
                 role="progressbar" aria-label="${t.title||p(`progress`)}"
                 aria-valuemin="0" aria-valuemax="100"
                 aria-valuenow="${i===void 0?a:i}"
                 aria-valuetext="${s||a}">
                <div class="bar-fill" style="${i===void 0?``:`width: ${i}%`}"></div>
            </div>`}renderMeta(e){let t=y(e.progress),n=_(e.progress)?null:I(e.progress.etaSeconds);return r`
            <div class="meta">
                ${t?r`<span>${f(`taskStepCount`,t)}</span>`:a}
                <span>${f(`taskElapsed`,{time:g(T(e,this.now))})}</span>
                ${n?r`<span class="eta">${n}</span>`:a}
                <span class="state state--${e.progress.state??`running`}">${this.stateLabel(e)}</span>
            </div>`}renderButtons(e,t){let n=e.progress,i=n.taskId;return _(n)?r`
            <div class="buttons">
                ${(n.resultActions??[]).map((e,t)=>r`
                    <button class="btn ${t===0||e.style===`primary`?`btn--primary`:``}"
                            @click="${()=>{F(i,e)&&v.dismiss(i)}}">${m(e)}</button>`)}
                ${n.state===`failed`&&n.retryable&&e.origin?.retry?r`
                    <button class="btn btn--primary" @click="${()=>P(i)}">${p(`retry`)}</button>`:a}
                <button class="btn" @click="${()=>v.dismiss(i)}">${p(t?`close`:`dismiss`)}</button>
            </div>`:r`
                <div class="buttons">
                    ${t&&n.backgroundable?r`
                        <button class="btn" @click="${()=>v.moveToBackground(i)}">${p(`taskBackground`)}</button>`:a}
                    ${n.cancellable?r`
                        <button class="btn" @click="${()=>void N(i)}">${p(`cancel`)}</button>`:a}
                </div>`}renderTask(e,t){let n=e.progress;return r`
            <div class="task task--${n.state??`running`}">
                <div class="task-title" id="${t?`mateu-task-title`:a}">${n.title}</div>
                ${n.text?r`<div class="task-text">${n.text}</div>`:a}
                ${n.state===`failed`&&n.error?r`<div class="task-error" role="alert">${n.error}</div>`:a}
                ${this.renderBar(e)}
                ${this.renderMeta(e)}
                ${this.renderButtons(e,t)}
            </div>`}renderModal(e){return r`
            <div class="backdrop"></div>
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mateu-task-title" tabindex="-1">
                ${this.renderTask(e,!0)}
            </div>`}renderList(e){return r`
            <div class="list" role="region" aria-label="${p(`tasks`)}">
                <div class="list-head">
                    <span class="list-title">${p(`tasks`)}</span>
                    ${b(this.tasks).finished>0?r`
                        <button class="link" @click="${()=>v.clearFinished()}">${p(`tasksClearFinished`)}</button>`:a}
                    <button class="icon" aria-label="${p(`close`)}" @click="${()=>{this.listOpen=!1}}">✕</button>
                </div>
                ${e.length===0?r`<div class="empty">${p(`tasksNone`)}</div>`:a}
                ${e.map(e=>this.renderTask(e,!1))}
                ${k()?r`
                    <button class="link os-notify" @click="${()=>void j()}">${p(`osNotificationsEnable`)}</button>`:a}
            </div>`}render(){let e=h(this.tasks,this.now),t=C(this.tasks).filter(t=>t!==e),n=b(this.tasks),i=t.length>0;return r`
            ${e?this.renderModal(e):a}
            ${i?r`
                <div class="dock">
                    ${this.listOpen?this.renderList(t):a}
                    <button class="indicator ${n.failed>0?`indicator--failed`:``}"
                            aria-expanded="${this.listOpen?`true`:`false`}"
                            aria-label="${n.running>0?f(`tasksShow`,{count:n.running}):p(`tasksShowIdle`)}"
                            @click="${()=>{this.listOpen=!this.listOpen}}">
                        <span class="spinner ${n.running>0?`spinner--on`:``}" aria-hidden="true"></span>
                        <span>${n.running>0?f(`tasksRunning`,{count:n.running}):p(`tasks`)}</span>
                    </button>
                </div>`:a}`}static{this.styles=i`
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
        ${O}
    `}};n([t()],L.prototype,`tasks`,void 0),n([t()],L.prototype,`listOpen`,void 0),n([t()],L.prototype,`now`,void 0),L=n([e(`mateu-task-center`)],L);export{L as MateuTaskCenter};