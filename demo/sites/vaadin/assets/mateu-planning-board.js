
import{S as e,T as t,a as n,i as r,k as i,o as a,x as o}from"./vendor-lit.js";import{i as s,r as c}from"./chromeTexts.js";import{$ as l,X as u,et as d,nt as f}from"./mateu-vaadin.js";var p,m=(e,t,n,r)=>{if(t.length){let n=Math.max(e.startIdx,Math.min(r-1,e.endIdx+t.length));return{...e,mode:`resize`,resourceId:e.originResourceId,endIdx:n}}let i=e.endIdx-e.startIdx,a=Math.max(0,Math.min(r-1-i,e.startIdx+(t.days??0))),o=n.indexOf(e.resourceId),s=Math.max(0,Math.min(n.length-1,o+(t.rows??0)));return{...e,mode:`move`,startIdx:a,endIdx:a+i,resourceId:n[s]??e.resourceId}},h=e=>!!e&&(e.resourceId!==e.originResourceId||e.startIdx!==e.originStartIdx||e.endIdx!==e.originEndIdx),g=(e,t)=>({startIdx:Math.min(e,t),endIdx:Math.max(e,t)}),_=(e,t,n,r)=>e===`start`?{startIdx:Math.min(r,n),endIdx:n}:{startIdx:t,endIdx:Math.max(r,t)},v=class extends o{static{p=this}constructor(...e){super(...e),this.resources=[],this.blocks=[],this.attributeColumns=[],this.resize=null,this.range=null,this.drag=null,this.pending=null,this.activeBlockId=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key===`Escape`&&(this.drag||this.resize||this.range)&&(e.stopPropagation(),this.endDrag())}}static{this.styles=[l,i`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .block:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #1a73e8);
            outline-offset: 2px;
        }
        .tools {
            display: flex; flex-wrap: wrap; align-items: center; gap: .25rem; margin-bottom: .35rem;
        }
        .tools button {
            font: inherit; min-width: 2rem; min-height: 2rem; cursor: pointer;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15)); border-radius: var(--lumo-border-radius-m, 6px);
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
        }
        .tools button.apply { background: var(--lumo-primary-color, #1a73e8); color: var(--lumo-primary-contrast-color, #fff); }
        .tools .pending { color: var(--lumo-secondary-text-color, #666); margin: 0 .35rem; }
        .sr-only {
            position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
            overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0;
        }
        .frame {
            display: grid;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow-x: auto;
        }
        /* the frame scrolls sideways at phone width: it takes the focus so a keyboard user can
           scroll it too (WCAG 2.1.1, W-V-SCROLLREGION) */
        .frame:focus-visible {
            outline: 2px solid var(--lumo-primary-color);
            outline-offset: 2px;
        }
        .corner, .label, .group, .day-head {
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            box-sizing: border-box;
        }
        .corner, .label, .group {
            position: sticky;
            left: 0;
            z-index: 3;
            background: var(--lumo-base-color, #fff);
        }
        .corner, .day-head {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .corner {
            padding: .45rem .75rem;
            background: var(--lumo-base-color, #fff);
        }
        .day-head {
            text-align: center;
            padding: .3rem .1rem;
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            white-space: nowrap;
            overflow: hidden;
            font-weight: 400;
            line-height: 1.15;
        }
        .day-head .dow {
            display: block;
            font-size: .7em;
            text-transform: uppercase;
            color: var(--lumo-secondary-text-color, #5f6b7a);
        }
        .day-head .num {
            font-weight: 600;
        }
        .day-head.weekend {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .day-head.today .num {
            color: var(--lumo-primary-text-color, var(--lumo-primary-color, #1a73e8));
        }
        .group {
            grid-column: 1 / -1;
            padding: .3rem .75rem;
            font-weight: 600;
            font-size: .8em;
            text-transform: uppercase;
            letter-spacing: .04em;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .label {
            padding: .55rem .75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-right: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .lane {
            grid-column: 2 / -1;
            position: relative;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            min-height: 2.2rem;
            box-sizing: border-box;
        }
        .cells {
            position: absolute;
            inset: 0;
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
        }
        .cell {
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.05));
        }
        .cell.weekend {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .today-line {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--lumo-error-color, #e11d48);
            opacity: .45;
            pointer-events: none;
        }
        .block {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.5rem;
            line-height: 1.5rem;
            border-radius: .5rem;
            background: var(--mateu-planning-block, var(--lumo-primary-color, #1a73e8));
            color: var(--mateu-planning-block-ink, var(--lumo-primary-contrast-color, #fff));
            padding: 0 .5rem;
            box-sizing: border-box;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 4px;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
        }
        .block.clickable {
            cursor: pointer;
        }
        .block.draggable {
            cursor: grab;
        }
        .block.dragging {
            opacity: .35;
            cursor: grabbing;
        }
        .label { display: flex; align-items: center; gap: .5rem; }
        .label .res-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; display: inline-flex; align-items: center; gap: .3rem; }
        .label .attr, .corner .attr {
            flex: 0 0 4rem; overflow: hidden; text-overflow: ellipsis; color: var(--lumo-secondary-text-color, #666);
            font-size: .85em;
        }
        .corner { display: flex; align-items: center; gap: .5rem; }
        .corner .res-name { flex: 1 1 auto; }
        .block vaadin-icon, .label vaadin-icon { width: .9rem; height: .9rem; vertical-align: -2px; margin-right: .2rem; }
        .handle {
            position: absolute; top: 0; bottom: 0; width: 6px; cursor: ew-resize; z-index: 1;
        }
        .handle.start { left: 0; }
        .handle.end { right: 0; }
        .handle:hover { background: rgba(255,255,255,.35); }
        .cells.selectable { cursor: crosshair; }
        .range {
            position: absolute; top: 15%; bottom: 15%;
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            border: 1px solid var(--lumo-primary-color-50pct, rgba(26,115,232,.5));
            border-radius: .35rem; pointer-events: none; z-index: 1;
        }
        .ghost {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.5rem;
            border-radius: .5rem;
            border: 2px dashed var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            box-sizing: border-box;
            pointer-events: none;
            z-index: 2;
        }
    `]}static parse(e){return new Date(e+`T00:00:00`)}static iso(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){let e=p.parse(this.from),t=p.daysBetween(e,p.parse(this.to))+1;return t>0?{from:e,days:t}:null}let e=this.blocks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>p.parse(e));if(!e.length)return null;let t=new Date(Math.min(...e.map(e=>e.getTime()))),n=new Date(Math.max(...e.map(e=>e.getTime())));return{from:t,days:p.daysBetween(t,n)+1}}onBlockPointerDown(e,t,n){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;let r=p.parse(t.start),i=p.parse(t.end),a=Math.max(1,p.daysBetween(r,i)+1);this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}));let o=this.dayAt(t.resourceId,e.clientX)??n;this.drag={blockId:t.id,duration:a,grabOffsetDays:o-n,originResourceId:t.resourceId,originStartIdx:n,targetResourceId:t.resourceId,targetStartIdx:n,moved:!1},window.addEventListener(`keydown`,this.onDragKeydown)}dayAt(e,t){let n=this.laneRects.find(t=>t.resourceId===e),r=this.window();if(!n||!r||n.rect.width===0)return null;let i=Math.floor((t-n.rect.left)/n.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;let t=this.window();if(!t)return;let n=this.laneRects.find(t=>e.clientY>=t.rect.top&&e.clientY<=t.rect.bottom)??this.laneRects.find(e=>e.resourceId===this.drag.targetResourceId);if(!n)return;let r=this.dayAt(n.resourceId,e.clientX);if(r==null)return;let i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:n.resourceId,targetStartIdx:i}}onBlockPointerUp(e){let t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;let n=this.window();if(!n)return;let r=p.addDays(n.from,t.targetStartIdx),i=p.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:p.iso(r),_end:p.iso(i)}},bubbles:!0,composed:!0}))}emit(e,t){this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}measureLanes(){this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}))}onHandlePointerDown(e,t,n,r,i){this.resizeActionId&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes(),this.resize={blockId:t.id,resourceId:t.resourceId,edge:n,startIdx:r,endIdx:i,originStartIdx:r,originEndIdx:i},window.addEventListener(`keydown`,this.onDragKeydown))}onHandlePointerMove(e){if(!this.resize)return;e.stopPropagation();let t=this.dayAt(this.resize.resourceId,e.clientX);t!=null&&(this.resize={...this.resize,..._(this.resize.edge,this.resize.originStartIdx,this.resize.originEndIdx,t)})}onHandlePointerUp(e){e.stopPropagation();let t=this.resize;this.endDrag();let n=this.window();t&&n&&this.resizeActionId&&(t.startIdx!==t.originStartIdx||t.endIdx!==t.originEndIdx)&&this.emit(this.resizeActionId,{_blockId:t.blockId,_resourceId:t.resourceId,_start:p.iso(p.addDays(n.from,t.startIdx)),_end:p.iso(p.addDays(n.from,t.endIdx))})}onCellsPointerDown(e,t){if(!this.rangeSelectActionId||e.button>0)return;e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes();let n=this.dayAt(t,e.clientX);n!=null&&(this.range={resourceId:t,anchorIdx:n,currentIdx:n},window.addEventListener(`keydown`,this.onDragKeydown))}onCellsPointerMove(e){if(!this.range)return;let t=this.dayAt(this.range.resourceId,e.clientX);t!=null&&t!==this.range.currentIdx&&(this.range={...this.range,currentIdx:t})}onCellsPointerUp(){let e=this.range;this.endDrag();let t=this.window();if(!e||!t||!this.rangeSelectActionId)return;let{startIdx:n,endIdx:r}=g(e.anchorIdx,e.currentIdx);this.emit(this.rangeSelectActionId,{_resourceId:e.resourceId,_start:p.iso(p.addDays(t.from,n)),_end:p.iso(p.addDays(t.from,r))})}blockIdx(e,t){return{startIdx:p.daysBetween(t.from,p.parse(e.start)),endIdx:p.daysBetween(t.from,p.parse(e.end))}}nudge(e,t){let n=this.window(),r=this.blocks.find(t=>t.id===e);if(!n||!r||!r.start||!r.end||(t.length?!this.resizeActionId:!this.moveActionId))return;let{startIdx:i,endIdx:a}=this.blockIdx(r,n),o=this.pending?.blockId===e&&this.pending.mode===(t.length?`resize`:`move`)?this.pending:{blockId:e,mode:t.length?`resize`:`move`,resourceId:r.resourceId,startIdx:i,endIdx:a,originResourceId:r.resourceId,originStartIdx:i,originEndIdx:a};this.pending=m(o,t,this.resources.map(e=>e.id),n.days)}applyPending(){let e=this.pending;this.pending=null;let t=this.window();if(!e||!t||!h(e))return!1;let n=e.mode===`resize`?this.resizeActionId:this.moveActionId;return n?(this.emit(n,{_blockId:e.blockId,_resourceId:e.resourceId,_start:p.iso(p.addDays(t.from,e.startIdx)),_end:p.iso(p.addDays(t.from,e.endIdx))}),!0):!1}cancelPending(){this.pending=null}onBlockKeydown(e,t){let n=t.id,r={ArrowLeft:{days:-1},ArrowRight:{days:1},ArrowUp:{rows:-1},ArrowDown:{rows:1}};if(e.key in r)e.preventDefault(),e.shiftKey&&(e.key===`ArrowLeft`||e.key===`ArrowRight`)?this.nudge(n,{length:e.key===`ArrowLeft`?-1:1}):this.nudge(n,r[e.key]);else if(e.key===`Escape`&&this.pending)e.preventDefault(),e.stopPropagation(),this.cancelPending();else if(e.key===`Enter`||e.key===` `){if(e.preventDefault(),this.applyPending())return;this.selectActionId?this.emit(this.selectActionId,{_blockId:n}):this.openActionId&&this.emit(this.openActionId,{_blockId:n})}}pendingText(){let e=this.pending,t=this.window();if(!e||!t)return``;let n=this.blocks.find(t=>t.id===e.blockId),r=this.resources.find(t=>t.id===e.resourceId),i=e=>p.addDays(t.from,e).toLocaleDateString();return s(`planningPending`,{block:n?.label??e.blockId,resource:r?.label??e.resourceId,start:i(e.startIdx),end:i(e.endIdx)})}renderTools(){let n=this.pending?.blockId??this.activeBlockId;if(!n||!this.moveActionId&&!this.resizeActionId)return e;let r=(e,n,r)=>t`
            <button type="button" aria-label="${e}" title="${e}" @click="${r}">${n}</button>`;return t`
            <div class="tools" role="toolbar" aria-label="${this.blocks.find(e=>e.id===n)?.label??``}"
                 @focusin="${()=>{this.activeBlockId=n}}">
                ${this.moveActionId?t`
                    ${r(c(`planningEarlier`),`◀`,()=>this.nudge(n,{days:-1}))}
                    ${r(c(`planningLater`),`▶`,()=>this.nudge(n,{days:1}))}
                    ${r(c(`planningRowUp`),`▲`,()=>this.nudge(n,{rows:-1}))}
                    ${r(c(`planningRowDown`),`▼`,()=>this.nudge(n,{rows:1}))}`:e}
                ${this.resizeActionId?t`
                    ${r(c(`planningShorter`),`−`,()=>this.nudge(n,{length:-1}))}
                    ${r(c(`planningLonger`),`+`,()=>this.nudge(n,{length:1}))}`:e}
                <span class="pending" aria-live="polite">${this.pendingText()}</span>
                ${h(this.pending)?t`
                    <button type="button" class="apply" @click="${()=>this.applyPending()}">${c(`apply`)}</button>
                    <button type="button" @click="${()=>this.cancelPending()}">${c(`cancel`)}</button>`:e}
            </div>`}endDrag(){this.drag=null,this.resize=null,this.range=null,window.removeEventListener(`keydown`,this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.onDragKeydown)}render(){let e=this.window();if(!e||!this.resources.length)return t``;let n=[...Array(e.days).keys()].map(t=>p.addDays(e.from,t)),r=new Date,i=p.daysBetween(e.from,new Date(r.getFullYear(),r.getMonth(),r.getDate())),a=i>=0&&i<e.days,o=[],s;return this.resources.forEach(r=>{r.group&&r.group!==s&&o.push(t`<div class="group">${r.group}</div>`),s=r.group,o.push(this.renderRow(r,e,n,a?i:null))}),t`
            ${this.renderTools()}
            <span id="planning-keys" class="sr-only">${c(`planningKeys`)}</span>
            <div class="frame" tabindex="0" role="region" aria-label="${c(`planningBoard`)}" style="grid-template-columns: minmax(${8+4.5*this.attributeColumns.length}rem, ${12+4.5*this.attributeColumns.length}rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner"><span class="res-name">${c(`resource`)}</span>${this.attributeColumns.map(e=>t`<span class="attr">${e}</span>`)}</div>
                ${n.map((e,n)=>t`
                    <div class="day-head ${this.isWeekend(e)?`weekend`:``} ${n===i?`today`:``}">
                        <span class="dow">${e.toLocaleDateString(void 0,{weekday:`short`})}</span>
                        <span class="num">${e.getDate()}</span>
                    </div>
                `)}
                ${o}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(n,r,i,a){let o=100/r.days,s=this.blocks.filter(e=>e.resourceId===n.id&&e.start&&e.end),c=this.drag?.moved&&this.drag.targetResourceId===n.id?this.drag:null,l=this.pending&&h(this.pending)&&this.pending.resourceId===n.id?this.pending:null;return t`
            <div class="label" title="${n.label??``}">
                <span class="res-name">${n.icon?d(n.icon):e}${n.label}</span>
                ${this.attributeColumns.map((e,r)=>t`<span class="attr">${(n.attributes??[])[r]??``}</span>`)}
            </div>
            <div class="lane" data-resource-id="${n.id}">
                <div class="cells ${this.rangeSelectActionId?`selectable`:``}"
                     @pointerdown="${e=>this.onCellsPointerDown(e,n.id)}"
                     @pointermove="${e=>this.onCellsPointerMove(e)}"
                     @pointerup="${()=>this.onCellsPointerUp()}"
                     @pointercancel="${()=>this.endDrag()}">
                    ${i.map(e=>t`<div class="cell ${this.isWeekend(e)?`weekend`:``}"></div>`)}
                </div>
                ${a==null?e:t`<div class="today-line" style="left: ${(a+.5)*o}%;"></div>`}
                ${s.map(n=>{let i=p.daysBetween(r.from,p.parse(n.start)),a=p.daysBetween(r.from,p.parse(n.end));if(a<0||i>=r.days)return e;let s=Math.max(0,i),c=Math.min(r.days-1,a),l=this.drag?.moved&&this.drag.blockId===n.id,f=this.resize?.blockId===n.id?this.resize:null,m=f?Math.max(0,f.startIdx):s,h=f?Math.min(r.days-1,f.endIdx):c,g=n.summary??`${n.label??``} · ${n.start} → ${n.end}${n.status?` · ${n.status}`:``}`;return t`
                        <div class="block ${this.selectActionId?`clickable`:``} ${this.moveActionId?`draggable`:``} ${l?`dragging`:``}"
                             title="${g}"
                             tabindex="0" role="button"
                             aria-label="${g}"
                             aria-describedby="${this.moveActionId||this.resizeActionId?`planning-keys`:e}"
                             @keydown="${e=>this.onBlockKeydown(e,n)}"
                             @focus="${()=>{this.activeBlockId=n.id}}"
                             style="left: ${m*o}%; width: ${(h-m+1)*o}%; ${n.color?`--mateu-planning-block: ${n.color}; ${u(n.color)?`--mateu-planning-block-ink: ${u(n.color)};`:``}`:``}"
                             @dblclick="${this.openActionId?()=>this.emit(this.openActionId,{_blockId:n.id}):e}"
                             @pointerdown="${e=>this.onBlockPointerDown(e,n,i)}"
                             @pointermove="${e=>this.onBlockPointerMove(e)}"
                             @pointerup="${()=>this.onBlockPointerUp(n)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${this.resizeActionId?t`<span class="handle start"
                                @pointerdown="${e=>this.onHandlePointerDown(e,n,`start`,i,a)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:e}${n.icon?d(n.icon):e}${n.label}${this.resizeActionId?t`<span class="handle end"
                                @pointerdown="${e=>this.onHandlePointerDown(e,n,`end`,i,a)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:e}</div>
                    `})}
                ${this.range&&this.range.resourceId===n.id?(()=>{let{startIdx:e,endIdx:n}=g(this.range.anchorIdx,this.range.currentIdx);return t`<div class="range" style="left: ${e*o}%; width: ${(n-e+1)*o}%;"></div>`})():e}
                ${l?t`
                    <div class="ghost pending-ghost"
                         style="left: ${l.startIdx*o}%; width: ${(l.endIdx-l.startIdx+1)*o}%;"></div>
                `:e}
                ${c?t`
                    <div class="ghost"
                         style="left: ${c.targetStartIdx*o}%; width: ${Math.min(c.duration,r.days-c.targetStartIdx)*o}%;"></div>
                `:e}
            </div>
        `}};f([n({type:Array})],v.prototype,`resources`,void 0),f([n({type:Array})],v.prototype,`blocks`,void 0),f([n()],v.prototype,`from`,void 0),f([n()],v.prototype,`to`,void 0),f([n()],v.prototype,`moveActionId`,void 0),f([n()],v.prototype,`selectActionId`,void 0),f([n({type:Array})],v.prototype,`attributeColumns`,void 0),f([n()],v.prototype,`resizeActionId`,void 0),f([n()],v.prototype,`openActionId`,void 0),f([n()],v.prototype,`rangeSelectActionId`,void 0),f([r()],v.prototype,`resize`,void 0),f([r()],v.prototype,`range`,void 0),f([r()],v.prototype,`drag`,void 0),f([r()],v.prototype,`pending`,void 0),f([r()],v.prototype,`activeBlockId`,void 0),v=p=f([a(`mateu-planning-board`)],v);export{v as MateuPlanningBoard,m as nudged,h as pendingChanged,g as rangeOf,_ as resizedDays};