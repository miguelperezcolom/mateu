import{i as e,n as t,r as n,t as r}from"./decorate-D1ynBJn5.js";import{a as i,d as a,n as o,t as s}from"./lit-DSH4rRgP.js";import{n as c}from"./chromeTexts-Onws9ST7.js";import{Y as l}from"./index-BhrzIcXN.js";var u=class extends s{constructor(...e){super(...e),this.fieldId=``,this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>this.emit(r.result),r.readAsDataURL(n),t.value=``}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:`environment`},audio:!1}),this.cameraOpen=!0,await this.updateComplete;let e=this.renderRoot.querySelector(`video`);e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){let e=this.renderRoot.querySelector(`video`);if(!e||e.videoWidth===0)return;let t=document.createElement(`canvas`);t.width=e.videoWidth,t.height=e.videoHeight,t.getContext(`2d`).drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL(`image/jpeg`,.9))}triggerFallback(){this.renderRoot.querySelector(`input[type=file]`)?.click()}render(){let e=this.value!=null&&this.value!==``;return i`
            <input type="file" accept="image/*" capture="environment" style="display: none;"
                   @change="${this.fileFallback}">
            ${this.cameraOpen?i`
                <video class="viewfinder" playsinline muted></video>
                <div class="actions">
                    <button class="button button--primary" @click="${this.shoot}">${c(`capture`)}</button>
                    <button class="button" @click="${this.closeCamera}">${c(`cancel`)}</button>
                </div>
            `:i`
                ${e?i`<img class="preview" src="${this.value}" alt="Photo"/>`:i`<div class="placeholder" aria-hidden="true">${l(`vaadin:camera`,`width: var(--lumo-icon-size-l, 2.25rem); height: var(--lumo-icon-size-l, 2.25rem);`)}</div>`}
                <div class="actions">
                    <button class="button button--primary" @click="${this.openCamera}">
                        ${e?`Retake`:`Take photo`}
                    </button>
                    ${this.cameraError?i`
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:o}
                    ${e?i`
                        <button class="button button--danger" @click="${()=>this.emit(``)}">${c(`delete`)}</button>`:o}
                </div>
                ${this.cameraError?i`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:o}
            `}`}static{this.styles=a`
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
    `}};r([n()],u.prototype,`fieldId`,void 0),r([n()],u.prototype,`value`,void 0),r([t()],u.prototype,`cameraOpen`,void 0),r([t()],u.prototype,`cameraError`,void 0),u=r([e(`mateu-camera-capture`)],u);export{u as MateuCameraCapture};