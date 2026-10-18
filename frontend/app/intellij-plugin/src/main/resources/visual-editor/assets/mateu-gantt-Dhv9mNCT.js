import{Ft as e,Mt as t,Ot as n,R as r,Rt as i,Tt as a,bt as o,f as s,ht as c,k as l,p as u,wt as d}from"./index-ZTn0iXbr.js";var f=864e5,p=class extends d{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=e`
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
    
        ${r}
    `}range(){let e=this.tasks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>new Date(e+`T00:00:00`).getTime());return e.length?{min:Math.min(...e)-f,max:Math.max(...e)+2*f}:null}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let e=this.range();if(!e)return n``;let t=e.max-e.min,r=n=>(n-e.min)/t*100,i=Date.now();return n`
            <div class="frame">
                <div class="head">${c(`task`)}</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(e=>n`
                        <div class="month" style="width: ${(e.to-e.from)/t*100}%;">${e.label}</div>
                    `)}
                </div>
                ${this.tasks.map(o=>{let c=new Date(o.start+`T00:00:00`).getTime(),d=new Date(o.end+`T00:00:00`).getTime()+f;return n`
                        <div class="label" title="${o.title}">${o.title}</div>
                        <div class="lane">
                            ${i>=e.min&&i<=e.max?n`<div class="today" style="left: ${r(i)}%;"></div>`:a}
                            <div role="${this.onTaskSelectionActionId?`button`:`img`}" tabindex=${l(u(!!this.onTaskSelectionActionId))}
                                 aria-label="${o.title}, ${o.start} to ${o.end}${o.progress?`, ${o.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${o.title} · ${o.start} → ${o.end}${o.progress?` · ${o.progress}%`:``}"
                                 @click="${()=>this.selectTask(o)}" @keydown="${s(()=>this.selectTask(o))}"
                                 style="left: ${r(c)}%; width: ${(d-c)/t*100}%; ${o.color?`--mateu-gantt-fill: ${o.color};`:``}">
                                <div class="fill" style="width: ${o.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};o([t({type:Array})],p.prototype,`tasks`,void 0),o([t()],p.prototype,`onTaskSelectionActionId`,void 0),p=o([i(`mateu-gantt`)],p);export{p as MateuGantt};