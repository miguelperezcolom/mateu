
import{T as e,_ as t,c as n,l as r,s as i,v as a,x as o}from"./vendor-lit.js";import{E as s,T as c,g as l,h as u,v as d}from"./mateu-vaadin.js";var f=1440*60*1e3;function p(e){let t=/^(\d{4})-(\d{2})-(\d{2})/.exec(e??``);if(!t)return null;let n=new Date(Number(t[1]),Number(t[2])-1,Number(t[3])).getTime();return isNaN(n)?null:n}function m(e){let t=(e??[]).flatMap(e=>{let t=p(e?.start),n=p(e?.end);return t==null||n==null?[]:[{task:e,start:t,end:Math.max(t,n)}]});if(!t.length)return null;let n=Math.min(...t.map(e=>e.start))-f,r=Math.max(...t.map(e=>e.end))+2*f,i=r-n;return{min:n,max:r,span:i,bars:t.map(e=>({...e,leftPct:(e.start-n)/i*100,widthPct:(e.end+f-e.start)/i*100}))}}var h=class extends t{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=e`
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
    
        ${d}
    `}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let e=m(this.tasks);if(!e)return o``;let t=e.span,n=n=>(n-e.min)/t*100,i=Date.now();return o`
            <div class="frame">
                <div class="head">${s(`task`)}</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(e=>o`
                        <div class="month" style="width: ${(e.to-e.from)/t*100}%;">${e.label}</div>
                    `)}
                </div>
                ${e.bars.map(({task:t,leftPct:s,widthPct:c})=>o`
                        <div class="label" title="${t.title}">${t.title}</div>
                        <div class="lane">
                            ${i>=e.min&&i<=e.max?o`<div class="today" style="left: ${n(i)}%;"></div>`:a}
                            <div role="${this.onTaskSelectionActionId?`button`:`img`}" tabindex=${r(l(!!this.onTaskSelectionActionId))}
                                 aria-label="${t.title}, ${t.start} to ${t.end}${t.progress?`, ${t.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${t.title} · ${t.start} → ${t.end}${t.progress?` · ${t.progress}%`:``}"
                                 @click="${()=>this.selectTask(t)}" @keydown="${u(()=>this.selectTask(t))}"
                                 style="left: ${s}%; width: ${c}%; ${t.color?`--mateu-gantt-fill: ${t.color};`:``}">
                                <div class="fill" style="width: ${t.progress??0}%;"></div>
                            </div>
                        </div>
                    `)}
            </div>
        `}};c([i({type:Array})],h.prototype,`tasks`,void 0),c([i()],h.prototype,`onTaskSelectionActionId`,void 0),h=c([n(`mateu-gantt`)],h);export{h as MateuGantt};