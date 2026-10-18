import{Ft as e,Mt as t,Ot as n,Rt as r,Tt as i,bt as a,ht as o,jt as s,wt as c}from"./index-CHEgOsOK.js";var l=class extends c{constructor(...e){super(...e),this.fieldId=``,this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{let t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;let n=t.getContext(`2d`);n.lineWidth=2,n.lineCap=`round`,n.lineJoin=`round`,n.strokeStyle=getComputedStyle(this).getPropertyValue(`--lumo-body-text-color`)||`#1a1a1a`;let[r,i]=this.pointerPosition(e);n.beginPath(),n.moveTo(r,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;let t=e.target.getContext(`2d`),[n,r]=this.pointerPosition(e);t.lineTo(n,r),t.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector(`canvas`)}pointerPosition(e){let t=e.target.getBoundingClientRect();return[e.clientX-t.left,e.clientY-t.top]}ensureCanvasSize(e){let t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){let e=this.canvas();e&&e.getContext(`2d`).clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){let e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL(`image/png`)))}renderPad(){return n`
            <canvas class="pad"
                    @pointerdown="${this.startStroke}"
                    @pointermove="${this.stroke}"
                    @pointerup="${this.endStroke}"
                    @pointercancel="${this.endStroke}"></canvas>
            <div class="actions">
                <button class="button" @click="${this.clear}">${o(`clear`)}</button>
                <button class="button button--primary" ?disabled="${!this.hasStrokes}"
                        @click="${this.accept}">${o(`accept`)}</button>
                ${this.value?n`
                    <button class="button" @click="${()=>{this.signing=!1}}">${o(`cancel`)}</button>`:i}
            </div>`}render(){let e=this.value!=null&&this.value!==``;return this.signing||!e?this.renderPad():n`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${()=>{this.signing=!0,this.hasStrokes=!1,this.updateComplete.then(()=>this.clear())}}">${o(`signAgain`)}</button>
                <button class="button button--danger" @click="${()=>this.emit(``)}">${o(`delete`)}</button>
            </div>`}static{this.styles=e`
        :host {
            display: block;
            max-width: 420px;
        }
        .pad {
            width: 100%;
            height: 160px;
            display: block;
            touch-action: none;
            background: var(--lumo-base-color, #fff);
            border: 1px dashed var(--lumo-contrast-40pct, rgba(0, 0, 0, 0.35));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            cursor: crosshair;
        }
        .preview {
            max-width: 100%;
            max-height: 160px;
            object-fit: contain;
            display: block;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            background: var(--lumo-base-color, #fff);
        }
        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.35rem 0.75rem;
            cursor: pointer;
        }
        .button--primary {
            background: var(--lumo-primary-color, rgb(0, 100, 200));
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .button--primary[disabled] {
            opacity: 0.5;
            cursor: default;
        }
        .button--danger {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
        }
    `}};a([t()],l.prototype,`fieldId`,void 0),a([t()],l.prototype,`value`,void 0),a([s()],l.prototype,`signing`,void 0),a([s()],l.prototype,`hasStrokes`,void 0),l=a([r(`mateu-signature-pad`)],l);export{l as MateuSignaturePad};