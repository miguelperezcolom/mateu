import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
    ActionsDoc, parseActionsDoc, serializeActionsDoc, catalogueIds, catalogueSteps, setCatalogueSteps,
    addCatalogueFlow, removeCatalogueAction, renameCatalogueAction, setCatalogueDescription,
} from '../model/actionsModel'
import { STEP_TYPES, stepParam, type FlowStep, type RawAction } from '../model/flowEditor'
import type { ProjectIndex } from '../model/projectIndex'
import '../widgets/ve-combo'
import type { ComboOption } from '../widgets/comboModel'

/**
 * The ACTION catalogue editor (`actions.yaml`, any `type: Actions` file): one card per named action —
 * its id (renamable), description and, for a flow, its steps, edited with the same flow model as a
 * page's or the shell's `actions:`. A REST action (`restAction:`) and every key the card does not show
 * are kept verbatim. Structured data, no canvas, no backend. Emits `actions-save` {yaml}.
 */
@customElement('actions-editor')
export class ActionsEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-base, #fff); font: 13px var(--ve-font, system-ui); color: var(--ve-text, #1f2937); }
        .head { display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 1rem 0.4rem; }
        .head h2 { margin: 0; font-size: 15px; }
        .head .sub { color: var(--ve-tertiary, #9ca3af); font-size: 12px; }
        .card { margin: 0.5rem 1rem; border: 1px solid var(--ve-border, #e3e5e8); border-radius: 8px; padding: 0.6rem 0.75rem; }
        .grid { display: grid; grid-template-columns: 7rem 1fr; gap: 0.35rem 0.6rem; align-items: center; }
        label { color: var(--ve-secondary, #6b7280); font-size: 12px; }
        input, select { width: 100%; padding: 0.35rem 0.45rem; font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade);
                border-radius: 6px; box-sizing: border-box; background: var(--ve-base, #fff); color: inherit; }
        input.id { font-weight: 600; }
        .kind { display: inline-block; font-size: 11px; padding: 0 0.4rem; border-radius: 999px; background: var(--ve-surface, #f3f4f6); color: var(--ve-secondary, #6b7280); }
        .steps { margin-top: 0.5rem; display: grid; gap: 0.3rem; }
        .step { display: flex; gap: 0.35rem; align-items: center; }
        .step select { width: 9rem; flex: none; }
        .step input, .step ve-combo { flex: 1; }
        .step .sep { flex: 1; }
        .row-end { margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center; color: var(--ve-tertiary, #9ca3af); font-size: 11px; gap: 0.5rem; }
        button { padding: 0.3rem 0.65rem; font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px;
                 background: var(--ve-base, #fff); cursor: pointer; color: inherit; }
        button.mini { padding: 0.2rem 0.45rem; }
        button.del { color: var(--ve-error, #b00020); }
        .add { margin: 0.5rem 1rem 1.5rem; display: flex; gap: 0.4rem; }
        .add input { width: 14rem; }
        .empty { padding: 1rem; color: var(--ve-tertiary, #9ca3af); }
        .note { padding: 0 1rem; color: var(--ve-tertiary, #9ca3af); font-size: 12px; }
    `

    @property() yaml = ''
    @property({ attribute: false }) project?: ProjectIndex
    @state() private doc: ActionsDoc = { actions: [], preamble: { type: 'Actions' } }
    @state() private newId = ''
    private lastEmitted?: string

    updated(changed: PropertyValues) {
        // Re-parse on a genuinely external change, but not on our own save echoed back.
        if (changed.has('yaml') && this.yaml !== this.lastEmitted) this.doc = parseActionsDoc(this.yaml)
    }

    private get routeOptions(): ComboOption[] {
        return (this.project?.routes ?? []).filter((r) => r.route).map((r) => ({ value: r.route, hint: r.definition ?? r.viewModel }))
    }

    render() {
        const ids = catalogueIds(this.doc)
        return html`
            <div class="head"><h2>Action catalogue</h2>
                <span class="sub">${ids.length} action${ids.length === 1 ? '' : 's'} · run by id from the shell menu and any page; an owner's own action of the same id wins</span></div>
            <div class="note">Only client-runnable actions belong here — a flow of steps, or a REST call. Server logic stays an @Action method.</div>
            ${this.doc.actions.length === 0 ? html`<div class="empty">No actions yet.</div>` : ''}
            ${this.doc.actions.map((a, i) => this.card(a, i))}
            <div class="add">
                <input placeholder="new action id" .value=${this.newId} @input=${(e: Event) => (this.newId = (e.target as HTMLInputElement).value)}
                    @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.addFlow()} />
                <button ?disabled=${!this.newId.trim() || ids.includes(this.newId.trim())} @click=${() => this.addFlow()}>+ Flow</button>
            </div>`
    }

    private card(a: RawAction, i: number): TemplateResult {
        const id = typeof a.id === 'string' ? a.id : ''
        const isRest = !!a.restAction
        const steps = id ? catalogueSteps(this.doc, id) : []
        const shown = ['id', 'description', 'steps']
        const hidden = Object.keys(a).filter((k) => !shown.includes(k))
        return html`<div class="card" data-action=${id}>
            <div class="grid">
                <label>id</label><input class="id" .value=${id} @change=${(e: Event) => this.rename(id, e)} />
                <label>description</label><input .value=${typeof a.description === 'string' ? a.description : ''}
                    placeholder="What it does (shown next to the id in pickers)"
                    @change=${(e: Event) => this.commit(setCatalogueDescription(this.doc, id, (e.target as HTMLInputElement).value))} />
                <label>kind</label><span><span class="kind">${isRest ? 'REST call' : 'flow'}</span></span>
            </div>
            ${isRest && !steps.length ? '' : html`<div class="steps">
                ${steps.map((s, j) => this.step(id, steps, s, j))}
                <div><button @click=${() => this.setSteps(id, [...steps, { type: 'Navigate', extra: {} }])}>+ Step</button></div>
            </div>`}
            <div class="row-end"><span>${hidden.length ? `${hidden.join(', ')} kept as written` : ''}</span>
                <button class="del" @click=${() => this.commit(id ? removeCatalogueAction(this.doc, id) : { ...this.doc, actions: this.doc.actions.filter((_, j) => j !== i) })}>Delete</button></div>
        </div>`
    }

    private step(id: string, steps: FlowStep[], s: FlowStep, i: number): TemplateResult {
        const p = stepParam(s.type)
        const others: ComboOption[] = catalogueIds(this.doc).filter((x) => x !== id).map((x) => ({ value: x, hint: 'catalog' }))
        return html`<div class="step">
            <select @change=${(e: Event) => this.setStep(id, steps, i, 'type', (e.target as HTMLSelectElement).value)}>
                ${STEP_TYPES.map((t) => html`<option value=${t} ?selected=${t === s.type}>${t}</option>`)}
            </select>
            ${!p ? html`<span class="sep"></span>`
                : p.key === 'event'
                    ? html`<input placeholder=${p.label} .value=${(s[p.key] as string) ?? ''}
                        @change=${(e: Event) => this.setStep(id, steps, i, p.key, (e.target as HTMLInputElement).value)} />`
                    : html`<ve-combo placeholder=${p.key === 'actionId' ? 'action id (catalogue or a server @Action)' : p.label} .value=${(s[p.key] as string) ?? ''}
                        .options=${p.key === 'route' ? this.routeOptions : others}
                        @change=${(e: Event) => this.setStep(id, steps, i, p.key, (e.target as HTMLInputElement).value)}></ve-combo>`}
            <button class="mini" @click=${() => this.moveStep(id, steps, i, -1)} ?disabled=${i === 0}>↑</button>
            <button class="mini" @click=${() => this.moveStep(id, steps, i, 1)} ?disabled=${i === steps.length - 1}>↓</button>
            <button class="mini del" @click=${() => this.setSteps(id, steps.filter((_, j) => j !== i))}>✕</button>
        </div>`
    }

    private rename(from: string, e: Event) {
        const input = e.target as HTMLInputElement
        const next = renameCatalogueAction(this.doc, from, input.value)
        if (next === this.doc) { input.value = from; return } // blank or taken: keep the old id
        this.commit(next)
    }

    private setStep(id: string, steps: FlowStep[], i: number, key: 'type' | 'route' | 'event' | 'actionId', value: string) {
        this.setSteps(id, steps.map((s, j) => (j === i ? { ...s, [key]: value } : s)))
    }

    private moveStep(id: string, steps: FlowStep[], i: number, delta: number) {
        const j = i + delta
        if (j < 0 || j >= steps.length) return
        const next = [...steps]
        ;[next[i], next[j]] = [next[j], next[i]]
        this.setSteps(id, next)
    }

    private setSteps(id: string, steps: FlowStep[]) {
        this.commit(setCatalogueSteps(this.doc, id, steps))
    }

    private addFlow() {
        const id = this.newId.trim()
        if (!id) return
        this.newId = ''
        this.commit(addCatalogueFlow(this.doc, id))
    }

    private commit(doc: ActionsDoc) {
        this.doc = doc
        const yaml = serializeActionsDoc(doc)
        this.lastEmitted = yaml
        this.dispatchEvent(new CustomEvent('actions-save', { detail: { yaml }, bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'actions-editor': ActionsEditor }
}
