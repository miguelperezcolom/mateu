
import{C as e,D as t,b as n,i as r,n as i,r as a,y as o}from"./vendor-lit.js";import{O as s,T as c,p as l,u}from"./mateu-vaadin.js";var d,f=(e,t)=>({startIdx:Math.min(e,t),endIdx:Math.max(e,t)}),p=(e,t,n,r)=>e===`start`?{startIdx:Math.min(r,n),endIdx:n}:{startIdx:t,endIdx:Math.max(r,t)},m=class extends o{static{d=this}constructor(...e){super(...e),this.resources=[],this.blocks=[],this.attributeColumns=[],this.resize=null,this.range=null,this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key===`Escape`&&(this.drag||this.resize||this.range)&&(e.stopPropagation(),this.endDrag())}}static{this.styles=t`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .frame {
            display: grid;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow-x: auto;
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
    `}static parse(e){return new Date(e+`T00:00:00`)}static iso(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){let e=d.parse(this.from),t=d.daysBetween(e,d.parse(this.to))+1;return t>0?{from:e,days:t}:null}let e=this.blocks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>d.parse(e));if(!e.length)return null;let t=new Date(Math.min(...e.map(e=>e.getTime()))),n=new Date(Math.max(...e.map(e=>e.getTime())));return{from:t,days:d.daysBetween(t,n)+1}}onBlockPointerDown(e,t,n){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;let r=d.parse(t.start),i=d.parse(t.end),a=Math.max(1,d.daysBetween(r,i)+1);this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}));let o=this.dayAt(t.resourceId,e.clientX)??n;this.drag={blockId:t.id,duration:a,grabOffsetDays:o-n,originResourceId:t.resourceId,originStartIdx:n,targetResourceId:t.resourceId,targetStartIdx:n,moved:!1},window.addEventListener(`keydown`,this.onDragKeydown)}dayAt(e,t){let n=this.laneRects.find(t=>t.resourceId===e),r=this.window();if(!n||!r||n.rect.width===0)return null;let i=Math.floor((t-n.rect.left)/n.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;let t=this.window();if(!t)return;let n=this.laneRects.find(t=>e.clientY>=t.rect.top&&e.clientY<=t.rect.bottom)??this.laneRects.find(e=>e.resourceId===this.drag.targetResourceId);if(!n)return;let r=this.dayAt(n.resourceId,e.clientX);if(r==null)return;let i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:n.resourceId,targetStartIdx:i}}onBlockPointerUp(e){let t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;let n=this.window();if(!n)return;let r=d.addDays(n.from,t.targetStartIdx),i=d.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:d.iso(r),_end:d.iso(i)}},bubbles:!0,composed:!0}))}emit(e,t){this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}measureLanes(){this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}))}onHandlePointerDown(e,t,n,r,i){this.resizeActionId&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes(),this.resize={blockId:t.id,resourceId:t.resourceId,edge:n,startIdx:r,endIdx:i,originStartIdx:r,originEndIdx:i},window.addEventListener(`keydown`,this.onDragKeydown))}onHandlePointerMove(e){if(!this.resize)return;e.stopPropagation();let t=this.dayAt(this.resize.resourceId,e.clientX);t!=null&&(this.resize={...this.resize,...p(this.resize.edge,this.resize.originStartIdx,this.resize.originEndIdx,t)})}onHandlePointerUp(e){e.stopPropagation();let t=this.resize;this.endDrag();let n=this.window();t&&n&&this.resizeActionId&&(t.startIdx!==t.originStartIdx||t.endIdx!==t.originEndIdx)&&this.emit(this.resizeActionId,{_blockId:t.blockId,_resourceId:t.resourceId,_start:d.iso(d.addDays(n.from,t.startIdx)),_end:d.iso(d.addDays(n.from,t.endIdx))})}onCellsPointerDown(e,t){if(!this.rangeSelectActionId||e.button>0)return;e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes();let n=this.dayAt(t,e.clientX);n!=null&&(this.range={resourceId:t,anchorIdx:n,currentIdx:n},window.addEventListener(`keydown`,this.onDragKeydown))}onCellsPointerMove(e){if(!this.range)return;let t=this.dayAt(this.range.resourceId,e.clientX);t!=null&&t!==this.range.currentIdx&&(this.range={...this.range,currentIdx:t})}onCellsPointerUp(){let e=this.range;this.endDrag();let t=this.window();if(!e||!t||!this.rangeSelectActionId)return;let{startIdx:n,endIdx:r}=f(e.anchorIdx,e.currentIdx);this.emit(this.rangeSelectActionId,{_resourceId:e.resourceId,_start:d.iso(d.addDays(t.from,n)),_end:d.iso(d.addDays(t.from,r))})}endDrag(){this.drag=null,this.resize=null,this.range=null,window.removeEventListener(`keydown`,this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.onDragKeydown)}render(){let t=this.window();if(!t||!this.resources.length)return e``;let n=[...Array(t.days).keys()].map(e=>d.addDays(t.from,e)),r=new Date,i=d.daysBetween(t.from,new Date(r.getFullYear(),r.getMonth(),r.getDate())),a=i>=0&&i<t.days,o=[],s;return this.resources.forEach(r=>{r.group&&r.group!==s&&o.push(e`<div class="group">${r.group}</div>`),s=r.group,o.push(this.renderRow(r,t,n,a?i:null))}),e`
            <div class="frame" style="grid-template-columns: minmax(${8+4.5*this.attributeColumns.length}rem, ${12+4.5*this.attributeColumns.length}rem) repeat(${t.days}, minmax(2.2rem, 1fr));">
                <div class="corner"><span class="res-name">${c(`resource`)}</span>${this.attributeColumns.map(t=>e`<span class="attr">${t}</span>`)}</div>
                ${n.map((t,n)=>e`
                    <div class="day-head ${this.isWeekend(t)?`weekend`:``} ${n===i?`today`:``}">
                        <span class="dow">${t.toLocaleDateString(void 0,{weekday:`short`})}</span>
                        <span class="num">${t.getDate()}</span>
                    </div>
                `)}
                ${o}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(t,r,i,a){let o=100/r.days,s=this.blocks.filter(e=>e.resourceId===t.id&&e.start&&e.end),c=this.drag?.moved&&this.drag.targetResourceId===t.id?this.drag:null;return e`
            <div class="label" title="${t.label??``}">
                <span class="res-name">${t.icon?l(t.icon):n}${t.label}</span>
                ${this.attributeColumns.map((n,r)=>e`<span class="attr">${(t.attributes??[])[r]??``}</span>`)}
            </div>
            <div class="lane" data-resource-id="${t.id}">
                <div class="cells ${this.rangeSelectActionId?`selectable`:``}"
                     @pointerdown="${e=>this.onCellsPointerDown(e,t.id)}"
                     @pointermove="${e=>this.onCellsPointerMove(e)}"
                     @pointerup="${()=>this.onCellsPointerUp()}"
                     @pointercancel="${()=>this.endDrag()}">
                    ${i.map(t=>e`<div class="cell ${this.isWeekend(t)?`weekend`:``}"></div>`)}
                </div>
                ${a==null?n:e`<div class="today-line" style="left: ${(a+.5)*o}%;"></div>`}
                ${s.map(t=>{let i=d.daysBetween(r.from,d.parse(t.start)),a=d.daysBetween(r.from,d.parse(t.end));if(a<0||i>=r.days)return n;let s=Math.max(0,i),c=Math.min(r.days-1,a),f=this.drag?.moved&&this.drag.blockId===t.id,p=this.resize?.blockId===t.id?this.resize:null,m=p?Math.max(0,p.startIdx):s,h=p?Math.min(r.days-1,p.endIdx):c,g=t.summary??`${t.label??``} · ${t.start} → ${t.end}${t.status?` · ${t.status}`:``}`;return e`
                        <div class="block ${this.selectActionId?`clickable`:``} ${this.moveActionId?`draggable`:``} ${f?`dragging`:``}"
                             title="${g}"
                             style="left: ${m*o}%; width: ${(h-m+1)*o}%; ${t.color?`--mateu-planning-block: ${t.color}; ${u(t.color)?`--mateu-planning-block-ink: ${u(t.color)};`:``}`:``}"
                             @dblclick="${this.openActionId?()=>this.emit(this.openActionId,{_blockId:t.id}):n}"
                             @pointerdown="${e=>this.onBlockPointerDown(e,t,i)}"
                             @pointermove="${e=>this.onBlockPointerMove(e)}"
                             @pointerup="${()=>this.onBlockPointerUp(t)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${this.resizeActionId?e`<span class="handle start"
                                @pointerdown="${e=>this.onHandlePointerDown(e,t,`start`,i,a)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:n}${t.icon?l(t.icon):n}${t.label}${this.resizeActionId?e`<span class="handle end"
                                @pointerdown="${e=>this.onHandlePointerDown(e,t,`end`,i,a)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:n}</div>
                    `})}
                ${this.range&&this.range.resourceId===t.id?(()=>{let{startIdx:t,endIdx:n}=f(this.range.anchorIdx,this.range.currentIdx);return e`<div class="range" style="left: ${t*o}%; width: ${(n-t+1)*o}%;"></div>`})():n}
                ${c?e`
                    <div class="ghost"
                         style="left: ${c.targetStartIdx*o}%; width: ${Math.min(c.duration,r.days-c.targetStartIdx)*o}%;"></div>
                `:n}
            </div>
        `}};s([a({type:Array})],m.prototype,`resources`,void 0),s([a({type:Array})],m.prototype,`blocks`,void 0),s([a()],m.prototype,`from`,void 0),s([a()],m.prototype,`to`,void 0),s([a()],m.prototype,`moveActionId`,void 0),s([a()],m.prototype,`selectActionId`,void 0),s([a({type:Array})],m.prototype,`attributeColumns`,void 0),s([a()],m.prototype,`resizeActionId`,void 0),s([a()],m.prototype,`openActionId`,void 0),s([a()],m.prototype,`rangeSelectActionId`,void 0),s([i()],m.prototype,`resize`,void 0),s([i()],m.prototype,`range`,void 0),s([i()],m.prototype,`drag`,void 0),m=d=s([r(`mateu-planning-board`)],m);export{m as MateuPlanningBoard,f as rangeOf,p as resizedDays};