import{Ft as e,Mt as t,Ot as n,St as r,Tt as i,_t as a,kt as o,xt as s}from"./index-CqC3Ae0J.js";var c=(e,t)=>{let n=[];for(let r of e.sections??[]){let e=!!r.title,i=e&&t.has(r.id);if(e&&n.push({kind:`section`,id:r.id,title:r.title,collapsed:i}),!i)for(let t of r.rows??[])n.push({kind:`row`,row:t,sectionId:r.id,indented:e})}return n},l=e=>new Set((e.sections??[]).filter(e=>e.title&&e.collapsed).map(e=>e.id)),u=e=>{let t=e.columns??[];if(!t.some(e=>e.group))return[];let n=[];for(let e of t){let t=e.group??``,r=n[n.length-1];r&&r.label===t?r.span++:n.push({label:t,span:1})}return n},d=new Set([`info`,`success`,`warning`,`danger`,`neutral`]),f=(e,t)=>e&&d.has(e)?e:t&&d.has(t)?t:``,p=class extends s{constructor(...e){super(...e),this.collapsed=new Set}willUpdate(e){e.has(`grid`)&&this.grid&&!this.seenGrid&&(this.collapsed=l(this.grid)),e.has(`grid`)&&(this.seenGrid=this.grid,this.editing=void 0)}toggle(e){let t=new Set(this.collapsed);t.has(e)?t.delete(e):t.add(e),this.collapsed=t}dispatch(e,t,n,r){let i=this.grid?.columns?.[n];this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{_rowId:t,_columnId:i?.id,_value:r}},bubbles:!0,composed:!0}))}commit(e,t,n){if(!this.editing)return;this.editing=void 0;let r=e.cells?.[t]?.value??``;n.value!==r&&this.grid?.editActionId&&this.dispatch(this.grid.editActionId,e.id,t,n.value)}renderCell(e,t){let n=this.grid,a=e.cells?.[t]??{},o=n.columns?.[t],s=f(a.tone,o?.tone),c=!!(e.editable&&n.editActionId),l=`${e.label??``}, ${o?.label??``}: ${a.value??``}`;if(this.editing&&this.editing.rowId===e.id&&this.editing.columnIndex===t)return i`<td class="cell ${s} editing"><input aria-label="${l}" .value="${a.value??``}"
                @keydown="${n=>{n.key===`Enter`&&this.commit(e,t,n.target),n.key===`Escape`&&(this.editing=void 0)}}"
                @blur="${n=>this.commit(e,t,n.target)}" /></td>`;let u=()=>{this.editing={rowId:e.id,columnIndex:t}};return a.link&&n.cellActionId?i`<td class="cell ${s}"><button class="link" type="button" aria-label="${l}"
                @click="${()=>this.dispatch(n.cellActionId,e.id,t,a.value??``)}">${a.value}</button></td>`:i`<td class="cell ${s} ${c?`editable`:``}" tabindex="${c?`0`:r}"
            aria-label="${c?l:r}"
            @dblclick="${c?u:r}"
            @keydown="${c?e=>{(e.key===`Enter`||e.key===`F2`)&&(e.preventDefault(),u())}:r}">${a.value}</td>`}updated(){this.renderRoot.querySelector(`td.editing input`)?.focus()}render(){let e=this.grid;if(!e)return r;let t=e.columns??[],n=u(e);return i`
            <div class="scroller">
                <table>
                    <thead>
                        ${n.length?i`<tr>
                            <th class="corner" rowspan="2">${e.rowHeaderLabel??``}</th>
                            ${n.map(e=>i`<th class="group" colspan="${e.span}">${e.label}</th>`)}
                        </tr>`:r}
                        <tr>
                            ${n.length?r:i`<th class="corner">${e.rowHeaderLabel??``}</th>`}
                            ${t.map(e=>i`<th class="col ${f(null,e.tone)}" scope="col">${e.label??e.id}</th>`)}
                        </tr>
                    </thead>
                    <tbody>
                        ${c(e,this.collapsed).map(e=>e.kind===`section`?i`<tr class="section"><th scope="rowgroup" class="rowhead">
                                    <button type="button" class="toggle" aria-expanded="${e.collapsed?`false`:`true`}"
                                            @click="${()=>this.toggle(e.id)}"><span class="chevron" aria-hidden="true">${e.collapsed?`▸`:`▾`}</span>${e.title}</button>
                                </th>${t.map(()=>i`<td class="cell section-cell"></td>`)}</tr>`:i`<tr class="${e.row.emphasis?`emphasis`:``}">
                                    <th scope="row" class="rowhead ${e.indented?`indented`:``}">${e.row.label}</th>
                                    ${t.map((t,n)=>this.renderCell(e.row,n))}
                                </tr>`)}
                    </tbody>
                </table>
            </div>
        `}static{this.styles=t`
        :host { display: block; max-width: 100%; }
        .scroller { overflow: auto; max-height: 36rem; border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px); }
        table { border-collapse: separate; border-spacing: 0; font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-body-text-color, #1a1a1a); }
        th, td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); white-space: nowrap; background: var(--lumo-base-color, #fff); }
        thead th { position: sticky; top: 0; z-index: 2; font-weight: 600; text-align: end; }
        thead tr:nth-child(2) th { top: 2rem; }
        thead th.group { text-align: start; }
        th.corner, th.rowhead { position: sticky; left: 0; z-index: 1; text-align: start; min-width: 12rem; }
        th.corner { z-index: 3; }
        th.rowhead.indented { padding-inline-start: 1.6rem; font-weight: 500; }
        td.cell { text-align: end; min-width: 4.5rem; }
        tr.emphasis td, tr.emphasis th { font-weight: 700; }
        tr.section th, tr.section td { background: var(--lumo-contrast-5pct, #f5f5f5); }
        .toggle { font: inherit; font-weight: 600; background: none; border: 0; padding: 0; cursor: pointer; color: inherit; display: inline-flex; gap: 0.4rem; }
        .chevron { width: 1em; }
        .link { font: inherit; background: none; border: 0; padding: 0; cursor: pointer; color: var(--lumo-primary-text-color, #0b6bcb); text-decoration: underline; }
        td.editable { cursor: text; box-shadow: inset 0 -2px 0 var(--lumo-contrast-20pct, rgba(0,0,0,.2)); }
        td.editing input { width: 4rem; font: inherit; text-align: end; }
        button:focus-visible, td.editable:focus-visible { outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: -2px; }
        .info { background-color: rgba(0, 110, 200, 0.08); }
        .success { background-color: rgba(30, 140, 60, 0.10); }
        .warning { background-color: rgba(220, 140, 0, 0.16); }
        .danger { background-color: rgba(200, 40, 30, 0.10); color: #b3261e; }
        .neutral { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
    `}};a([o({attribute:!1})],p.prototype,`grid`,void 0),a([n()],p.prototype,`collapsed`,void 0),a([n()],p.prototype,`editing`,void 0),p=a([e(`mateu-matrix-grid`)],p);export{p as MateuMatrixGrid,u as columnGroupsOf,l as initiallyCollapsed,c as matrixLinesOf,f as toneOf};