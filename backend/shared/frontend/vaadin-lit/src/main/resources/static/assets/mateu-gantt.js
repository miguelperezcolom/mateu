
import{S as e,T as t,a as n,k as r,o as i,p as a,x as o}from"./vendor-lit.js";import{r as s}from"./chromeTexts.js";import{H as c,L as l,R as u,z as d}from"./mateu-vaadin.js";var f=864e5;function p(e){let t=/^(\d{4})-(\d{2})-(\d{2})/.exec(e??``);if(!t)return null;let n=new Date(Number(t[1]),Number(t[2])-1,Number(t[3])).getTime();return isNaN(n)?null:n}function m(e){let t=(e??[]).flatMap(e=>{let t=p(e?.start),n=p(e?.end);return t==null||n==null?[]:[{task:e,start:t,end:Math.max(t,n)}]});if(!t.length)return null;let n=Math.min(...t.map(e=>e.start))-f,r=Math.max(...t.map(e=>e.end))+2*f,i=r-n;return{min:n,max:r,span:i,bars:t.map(e=>({...e,leftPct:(e.start-n)/i*100,widthPct:(e.end+f-e.start)/i*100}))}}function h(e,t){let n=new Date(e),r=new Date(t),i=(r.getFullYear()-n.getFullYear())*12+(r.getMonth()-n.getMonth())+1;return i<=18?`month`:i<=54?`quarter`:i<=360?`year`:`decade`}function g(e,t,n=h(e,t)){if(!(t>e))return[];let r=n===`month`?1:n===`quarter`?3:n===`year`?12:120,i=new Date(e),a=n===`month`?i.getMonth():n===`quarter`?i.getMonth()-i.getMonth()%3:0,o=n===`decade`?i.getFullYear()-i.getFullYear()%10:i.getFullYear(),s=new Date(o,a,1),c=[];for(;s.getTime()<t;){let i=new Date(s.getFullYear(),s.getMonth()+r,1),a=Math.max(s.getTime(),e),o=Math.min(i.getTime(),t);o>a&&c.push({label:_(s,n),from:a,to:o}),s=i}return c}function _(e,t){switch(t){case`month`:return e.toLocaleDateString(void 0,{month:`short`,year:`2-digit`});case`quarter`:return`Q${Math.floor(e.getMonth()/3)+1} '${String(e.getFullYear()).slice(-2)}`;case`year`:return String(e.getFullYear());case`decade`:return`${e.getFullYear()}s`}}var v=class extends o{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=r`
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
            min-width: 0;
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
    `}render(){let n=m(this.tasks);if(!n)return t``;let r=n.span,i=e=>(e-n.min)/r*100,o=Date.now();return t`
            <div class="frame">
                <div class="head">${s(`task`)}</div>
                <div class="head months">
                    ${g(n.min,n.max).map(e=>t`
                        <div class="month" style="width: ${(e.to-e.from)/r*100}%;">${e.label}</div>
                    `)}
                </div>
                ${n.bars.map(({task:r,leftPct:s,widthPct:c})=>t`
                        <div class="label" title="${r.title}">${r.title}</div>
                        <div class="lane">
                            ${o>=n.min&&o<=n.max?t`<div class="today" style="left: ${i(o)}%;"></div>`:e}
                            <div role="${this.onTaskSelectionActionId?`button`:`img`}" tabindex=${a(u(!!this.onTaskSelectionActionId))}
                                 aria-label="${r.title}, ${r.start} to ${r.end}${r.progress?`, ${r.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${r.title} · ${r.start} → ${r.end}${r.progress?` · ${r.progress}%`:``}"
                                 @click="${()=>this.selectTask(r)}" @keydown="${l(()=>this.selectTask(r))}"
                                 style="left: ${s}%; width: ${c}%; ${r.color?`--mateu-gantt-fill: ${r.color};`:``}">
                                <div class="fill" style="width: ${r.progress??0}%;"></div>
                            </div>
                        </div>
                    `)}
            </div>
        `}};c([n({type:Array})],v.prototype,`tasks`,void 0),c([n()],v.prototype,`onTaskSelectionActionId`,void 0),v=c([i(`mateu-gantt`)],v);export{v as MateuGantt};