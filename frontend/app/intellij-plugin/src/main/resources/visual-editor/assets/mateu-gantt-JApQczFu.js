import{E as e,F as t,Ft as n,Mt as r,St as i,Tt as a,_t as o,f as s,ft as c,kt as l,p as u,xt as d}from"./index-B3DeFpz1.js";var f=864e5,p=class extends d{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=r`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .frame {
            display: grid;
            grid-template-columns: minmax(9rem, 14rem) 1fr;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .label, .lane, .head {
            padding: .45rem .75rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            box-sizing: border-box;
        }
        .head {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .months {
            display: flex;
            padding: 0;
        }
        .month {
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            padding: .45rem 0 .45rem .5rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-sizing: border-box;
        }
        .label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .lane {
            position: relative;
            padding: .45rem 0;
        }
        .bar {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.15rem;
            border-radius: .6rem;
            background: var(--mateu-gantt-bar, var(--lumo-contrast-20pct, #cbd5e1));
            overflow: hidden;
            min-width: 4px;
        }
        .bar.clickable {
            cursor: pointer;
        }
        .bar.clickable:hover {
            filter: brightness(0.94);
            box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct, rgba(26,115,232,.5));
        }
        .fill {
            height: 100%;
            background: var(--mateu-gantt-fill, var(--lumo-primary-color, #1a73e8));
            border-radius: .6rem 0 0 .6rem;
        }
        .today {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--lumo-error-color, #e11d48);
            opacity: .55;
        }
    
        ${t}
    `}range(){let e=this.tasks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>new Date(e+`T00:00:00`).getTime());return e.length?{min:Math.min(...e)-f,max:Math.max(...e)+2*f}:null}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let t=this.range();if(!t)return a``;let n=t.max-t.min,r=e=>(e-t.min)/n*100,o=Date.now();return a`
            <div class="frame">
                <div class="head">${c(`task`)}</div>
                <div class="head months">
                    ${this.months(t.min,t.max).map(e=>a`
                        <div class="month" style="width: ${(e.to-e.from)/n*100}%;">${e.label}</div>
                    `)}
                </div>
                ${this.tasks.map(c=>{let l=new Date(c.start+`T00:00:00`).getTime(),d=new Date(c.end+`T00:00:00`).getTime()+f;return a`
                        <div class="label" title="${c.title}">${c.title}</div>
                        <div class="lane">
                            ${o>=t.min&&o<=t.max?a`<div class="today" style="left: ${r(o)}%;"></div>`:i}
                            <div role="${this.onTaskSelectionActionId?`button`:`img`}" tabindex=${e(u(!!this.onTaskSelectionActionId))}
                                 aria-label="${c.title}, ${c.start} to ${c.end}${c.progress?`, ${c.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${c.title} · ${c.start} → ${c.end}${c.progress?` · ${c.progress}%`:``}"
                                 @click="${()=>this.selectTask(c)}" @keydown="${s(()=>this.selectTask(c))}"
                                 style="left: ${r(l)}%; width: ${(d-l)/n*100}%; ${c.color?`--mateu-gantt-fill: ${c.color};`:``}">
                                <div class="fill" style="width: ${c.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};o([l({type:Array})],p.prototype,`tasks`,void 0),o([l()],p.prototype,`onTaskSelectionActionId`,void 0),p=o([n(`mateu-gantt`)],p);export{p as MateuGantt};