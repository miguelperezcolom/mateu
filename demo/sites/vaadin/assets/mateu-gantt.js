
import{_ as e,b as t,c as n,g as r,o as i,s as a,w as o}from"./vendor-lit.js";import{E as s,T as c,g as l,h as u,v as d}from"./mateu-vaadin.js";var f=1440*60*1e3;function p(e){let t=/^(\d{4})-(\d{2})-(\d{2})/.exec(e??``);if(!t)return null;let n=new Date(Number(t[1]),Number(t[2])-1,Number(t[3])).getTime();return isNaN(n)?null:n}function m(e){let t=(e??[]).flatMap(e=>{let t=p(e?.start),n=p(e?.end);return t==null||n==null?[]:[{task:e,start:t,end:Math.max(t,n)}]});if(!t.length)return null;let n=Math.min(...t.map(e=>e.start))-f,r=Math.max(...t.map(e=>e.end))+2*f,i=r-n;return{min:n,max:r,span:i,bars:t.map(e=>({...e,leftPct:(e.start-n)/i*100,widthPct:(e.end+f-e.start)/i*100}))}}var h=class extends r{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=o`
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
    `}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let r=m(this.tasks);if(!r)return t``;let i=r.span,a=e=>(e-r.min)/i*100,o=Date.now();return t`
            <div class="frame">
                <div class="head">${s(`task`)}</div>
                <div class="head months">
                    ${this.months(r.min,r.max).map(e=>t`
                        <div class="month" style="width: ${(e.to-e.from)/i*100}%;">${e.label}</div>
                    `)}
                </div>
                ${r.bars.map(({task:i,leftPct:s,widthPct:c})=>t`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${o>=r.min&&o<=r.max?t`<div class="today" style="left: ${a(o)}%;"></div>`:e}
                            <div role="${this.onTaskSelectionActionId?`button`:`img`}" tabindex=${n(l(!!this.onTaskSelectionActionId))}
                                 aria-label="${i.title}, ${i.start} to ${i.end}${i.progress?`, ${i.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:``}"
                                 @click="${()=>this.selectTask(i)}" @keydown="${u(()=>this.selectTask(i))}"
                                 style="left: ${s}%; width: ${c}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:``}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `)}
            </div>
        `}};c([i({type:Array})],h.prototype,`tasks`,void 0),c([i()],h.prototype,`onTaskSelectionActionId`,void 0),h=c([a(`mateu-gantt`)],h);export{h as MateuGantt};