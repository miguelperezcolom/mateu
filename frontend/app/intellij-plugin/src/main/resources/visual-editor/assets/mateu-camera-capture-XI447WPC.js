import{Ft as e,L as t,Mt as n,Ot as r,Rt as i,Tt as a,bt as o,ht as s,jt as c,wt as l}from"./index-D6kVJnRV.js";var u=class extends l{constructor(...e){super(...e),this.fieldId=``,this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>this.emit(r.result),r.readAsDataURL(n),t.value=``}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:`environment`},audio:!1}),this.cameraOpen=!0,await this.updateComplete;let e=this.renderRoot.querySelector(`video`);e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){let e=this.renderRoot.querySelector(`video`);if(!e||e.videoWidth===0)return;let t=document.createElement(`canvas`);t.width=e.videoWidth,t.height=e.videoHeight,t.getContext(`2d`).drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL(`image/jpeg`,.9))}triggerFallback(){this.renderRoot.querySelector(`input[type=file]`)?.click()}render(){let e=this.value!=null&&this.value!==``;return r`
            <input type="file" accept="image/*" capture="environment" style="display: none;"
                   @change="${this.fileFallback}">
            ${this.cameraOpen?r`
                <video class="viewfinder" playsinline muted></video>
                <div class="actions">
                    <button class="button button--primary" @click="${this.shoot}">${s(`capture`)}</button>
                    <button class="button" @click="${this.closeCamera}">${s(`cancel`)}</button>
                </div>
            `:r`
                ${e?r`<img class="preview" src="${this.value}" alt="Photo"/>`:r`<div class="placeholder" aria-hidden="true">${t(`vaadin:camera`,`width: var(--lumo-icon-size-l, 2.25rem); height: var(--lumo-icon-size-l, 2.25rem);`)}</div>`}
                <div class="actions">
                    <button class="button button--primary" @click="${this.openCamera}">
                        ${e?`Retake`:`Take photo`}
                    </button>
                    ${this.cameraError?r`
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:a}
                    ${e?r`
                        <button class="button button--danger" @click="${()=>this.emit(``)}">${s(`delete`)}</button>`:a}
                </div>
                ${this.cameraError?r`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:a}
            `}`}static{this.styles=e`
        :host {
            display: block;
            max-width: 420px;
        }
        .viewfinder {
            width: 100%;
            max-height: 260px;
            display: block;
            background: #000;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
        }
        .preview {
            max-width: 100%;
            max-height: 240px;
            object-fit: contain;
            display: block;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
        }
        .placeholder {
            height: 135px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border: 1px dashed var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
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
        .button--danger {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
        }
        .error-hint {
            margin-top: 0.35rem;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
    `}};o([n()],u.prototype,`fieldId`,void 0),o([n()],u.prototype,`value`,void 0),o([c()],u.prototype,`cameraOpen`,void 0),o([c()],u.prototype,`cameraError`,void 0),u=o([i(`mateu-camera-capture`)],u);export{u as MateuCameraCapture};