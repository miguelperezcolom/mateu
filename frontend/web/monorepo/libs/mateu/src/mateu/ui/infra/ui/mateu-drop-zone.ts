import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type DropZone from '@mateu/shared/apiClients/dtos/componentmetadata/DropZone'
import { draggedIdsOf, dragMimeOf, dropParamsOf } from '@infra/ui/dragAndDrop.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'

/**
 * A place to drop dragged listing rows (`DropZone`): a titled card wrapping its content (slotted).
 * While rows of the accepted type are dragged anywhere it offers itself (dashed border), it lights
 * up under the pointer, and the drop dispatches the standard `action-requested` with the zone's
 * parameters plus `_draggedIds` and `_dragType`. DS-neutral (Lumo variables with fallbacks).
 */
@customElement('mateu-drop-zone')
export class MateuDropZone extends LitElement {

    @property({ attribute: false }) zone: DropZone | undefined
    @state() ready = false
    @state() over = false

    private get mime() { return dragMimeOf(this.zone?.accept) }

    private accepts(e: DragEvent) {
        const types = e.dataTransfer ? Array.from(e.dataTransfer.types) : []
        return !!this.mime && types.includes(this.mime)
    }

    private onDocumentDragStart = (e: DragEvent) => {
        // the types are readable once the source has set its data, a tick later
        setTimeout(() => { this.ready = this.accepts(e) })
    }
    private onDocumentDragEnd = () => { this.ready = false; this.over = false }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('dragstart', this.onDocumentDragStart, true)
        document.addEventListener('dragend', this.onDocumentDragEnd, true)
    }

    disconnectedCallback() {
        document.removeEventListener('dragstart', this.onDocumentDragStart, true)
        document.removeEventListener('dragend', this.onDocumentDragEnd, true)
        super.disconnectedCallback()
    }

    private onDragOver(e: DragEvent) {
        if (!this.accepts(e)) return
        e.preventDefault()
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
        this.over = true
    }

    private onDrop(e: DragEvent) {
        if (!this.accepts(e)) return
        e.preventDefault()
        this.over = false
        this.ready = false
        const ids = draggedIdsOf(e.dataTransfer?.getData(this.mime) ?? '')
        if (!ids.length || !this.zone?.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.zone.actionId, parameters: dropParamsOf(this.zone.parameters, ids, this.zone.accept ?? '') },
            bubbles: true,
            composed: true,
        }))
    }

    render() {
        const zone = this.zone
        if (!zone) return nothing
        return html`
            <div class="zone ${this.ready ? 'ready' : ''} ${this.over ? 'over' : ''}" role="group"
                 aria-label="${(zone.title ?? '') + (zone.subtitle ? ', ' + zone.subtitle : '')} — drop target"
                 @dragover="${this.onDragOver}" @dragleave="${() => { this.over = false }}" @drop="${this.onDrop}">
                ${zone.title ? html`<div class="title">${zone.title}</div>` : nothing}
                ${zone.subtitle ? html`<div class="subtitle">${zone.subtitle}</div>` : nothing}
                <slot></slot>
                ${this.ready ? html`<div class="hint">${chromeText('dropHere')}</div>` : nothing}
            </div>`
    }

    static styles = css`
        :host { display: block; }
        .zone {
            padding: var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-l, 10px);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff);
            transition: border-color .15s, background-color .15s; height: 100%; box-sizing: border-box;
        }
        .zone.ready { border: 2px dashed var(--lumo-primary-color, #1a73e8); }
        .zone.over { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1)); }
        .title { font-weight: 600; }
        .subtitle { font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666); margin-bottom: .25rem; }
        .hint { margin-top: .5rem; font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-primary-text-color, #1a73e8); }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-drop-zone': MateuDropZone
    }
}
