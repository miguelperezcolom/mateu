import { LitElement, html, css } from 'lit'
import '../widgets/ve-combo'
import type { ComboOption } from '../widgets/comboModel'
import { customElement, property, state } from 'lit/decorators.js'
import { PageNode, scalarProps } from '../model/pageModel'
import { PropSpec, slotProps } from '../model/componentSchema'
import { specFor } from '../model/schemaCatalog'
import type { ProjectIndex } from '../model/projectIndex'
import type { ContractMembers } from '../model/contract'

/**
 * The properties pane (right). Driven by the generated component schema: for the selected node it
 * shows that component's known properties with a TYPED editor each (enum → dropdown, boolean →
 * checkbox, number → number field, string → text), so editing is guided rather than a guess-the-key
 * free-for-all. Props present in the YAML but not in the schema (hand-authored, or a newer catalog)
 * stay editable as text, and any property can still be added by hand. Structural props (children /
 * nested components) are edited on the canvas, not here.
 *
 * A few complex shapes authors touch constantly get a real editor instead of "edit in YAML": a
 * REST data source (pick a named source from `sources.yaml`, or type a url), a button's navigation
 * (`actionable: RouteLink` → pick a route), a field's fixed `options`, and the component's slot
 * lists (add a column / filter / toolbar button / tab). A bound `id` can be renamed with its
 * references (`binding-rename`).
 *
 * Emits: `prop-changed` {key,value}, `node-delete`, `node-move` {delta}, `slot-add` {key, ref},
 * `binding-rename` {from}.
 */
@customElement('editor-properties')
export class EditorProperties extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-surface, #f7f8fa); border-left: 1px solid var(--ve-border, #e3e5e8); }
        .title { padding: 0.6rem 0.75rem; font: 600 12px var(--ve-font, system-ui); color: var(--ve-text, #374151); border-bottom: 1px solid var(--ve-border, #e3e5e8); }
        .empty { padding: 1rem 0.75rem; font: 13px var(--ve-font, system-ui); color: var(--ve-tertiary, #9ca3af); }
        .type { padding: 0.5rem 0.75rem; font: 600 13px var(--ve-font, system-ui); color: var(--ve-text, #111827); }
        .section { padding: 0.15rem 0.75rem 0.1rem; font: 600 10px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .04em; color: var(--ve-tertiary, #9ca3af); margin-top: 0.35rem; }
        label { display: block; padding: 0.25rem 0.75rem 0; font: 11px var(--ve-font, system-ui); color: var(--ve-secondary, #6b7280); }
        label .req { color: #d1495b; }
        input, select { display: block; width: calc(100% - 1.5rem); margin: 0.1rem 0.75rem 0.35rem; padding: 0.35rem 0.5rem;
                font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px; box-sizing: border-box; background: var(--ve-base, #fff); color: inherit; }
        textarea.note { display: block; width: calc(100% - 1.5rem); margin: 0.1rem 0.75rem 0.35rem; padding: 0.35rem 0.5rem; resize: vertical;
                font: 12px var(--ve-font, system-ui); border: 1px solid #ecd98a; border-radius: 6px; box-sizing: border-box;
                background: #fffbe6; color: #3b3200; }
        .check { display: flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.75rem 0.35rem; font: 13px var(--ve-font, system-ui); color: var(--ve-text, #374151); }
        .check input { width: auto; margin: 0; }
        .muted { padding: 0.15rem 0.75rem 0.35rem; font: 12px var(--ve-font, system-ui); color: var(--ve-tertiary, #b0b6be); }
        .row { display: flex; gap: 0.4rem; padding: 0.6rem 0.75rem; border-top: 1px solid var(--ve-border, #e3e5e8); margin-top: 0.5rem; }
        .row button { flex: 1; padding: 0.4rem; font: 12px var(--ve-font, system-ui); background: var(--ve-base, #fff); color: inherit; border: 1px solid var(--ve-input-border, #d7dade);
                      border-radius: 6px; cursor: pointer; }
        .row button.danger { color: var(--ve-error, #b00020); border-color: #f2c2c8; }
        .add { display: flex; gap: 0.4rem; padding: 0.4rem 0.75rem 0.6rem; }
        .add input { margin: 0; }
        .add button { padding: 0 0.6rem; font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px; background: var(--ve-base, #fff); color: inherit; cursor: pointer; }
        .inline { display: flex; gap: 0.3rem; align-items: center; margin: 0.1rem 0.75rem 0.35rem; }
        .inline input, .inline select { margin: 0; width: auto; flex: 1; min-width: 0; }
        .inline button, .slots button { padding: 0.3rem 0.55rem; font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade);
            border-radius: 6px; background: var(--ve-base, #fff); color: inherit; cursor: pointer; white-space: nowrap; }
        .slots { display: flex; flex-wrap: wrap; gap: 0.3rem; padding: 0.2rem 0.75rem 0.4rem; }
        .help { padding: 0 0.75rem 0.3rem; font: 11px var(--ve-font, system-ui); color: var(--ve-tertiary, #9ca3af); }
        .muted-inline { color: var(--ve-tertiary, #b0b6be); }
        details.more { margin: 0.2rem 0 0.3rem; }
        details.more summary { cursor: pointer; padding: 0.3rem 0.75rem; font: 12px var(--ve-font, system-ui);
            color: var(--ve-primary-text, #1d4ed8); list-style: none; }
        details.more summary::-webkit-details-marker { display: none; }
        details.more summary::before { content: '▸ '; }
        details.more[open] summary::before { content: '▾ '; }
    `

    @property({ attribute: false }) node: PageNode | null = null
    @property({ attribute: false }) project?: ProjectIndex
    @property({ attribute: false }) contract?: ContractMembers
    /** The ids of the actions this page declares (its `actions:` — REST calls and flows). */
    @property({ attribute: false }) pageActionIds: string[] = []
    @state() private moreOpen = false

    render() {
        const node = this.node
        if (!node) return html`<div class="title">Properties</div><div class="empty">Select a component on the canvas.</div>`

        const spec = specFor(node.type)
        // Scalar props the schema declares for this component (typed editors).
        // `note` (the design note) has its own box at the top, not a row among the properties.
        const known = spec ? spec.props.filter((p) => p.kind !== 'children' && p.kind !== 'complex' && p.name !== 'note') : []
        // Complex props with a dedicated editor (data sources, navigation, options).
        const rich = spec ? spec.props.filter((p) => RICH.has(p.ref ?? '') || (p.kind === 'children' && p.ref === 'Option')) : []
        const slots = slotProps(spec)
        const richNames = new Set([...rich, ...slots].map((p) => p.name))
        const structural = spec ? spec.props.filter((p) => (p.kind === 'children' || p.kind === 'complex') && !richNames.has(p.name) && p.name !== 'content') : []
        // The props an author reaches for first stay in view; the long tail (a FormField has ~50) folds
        // under "More properties" — always including anything already set on the node.
        const common = new Set(COMMON[node.type] ?? known.slice(0, 8).map((p) => p.name))
        const isPrimary = (p: PropSpec) => common.has(p.name) || p.required || node[p.name] !== undefined
        const primary = known.filter(isPrimary)
        const more = known.filter((p) => !isPrimary(p))
        const knownNames = new Set([...known.map((p) => p.name), ...richNames, ...structural.map((p) => p.name)])
        // Props on the node the schema does not know (hand-authored, or a newer catalog) — keep editable.
        const extra = scalarProps(node).filter((k) => k !== 'note' && !knownNames.has(k) && (node[k] == null || typeof node[k] !== 'object'))

        return html`
            <div class="title">Properties</div>
            <div class="type">${node.type}${spec ? '' : ' (unknown)'}</div>
            <label for="ve-note">Note <span class="muted-inline">— what this should do; goes in the view-model prompt, never rendered</span></label>
            <textarea id="ve-note" class="note" rows="2" placeholder="e.g. must be unique · only managers can change it"
                .value=${typeof node.note === 'string' ? node.note : ''}
                @change=${(e: Event) => this.fire('prop-changed', { key: 'note', value: (e.target as HTMLTextAreaElement).value.trim() })}></textarea>

            ${known.length ? html`<div class="section">Properties</div>` : ''}
            ${primary.map((p) => this.field(p, node[p.name]))}
            ${more.length ? html`<details class="more" ?open=${this.moreOpen}
                    @toggle=${(e: Event) => (this.moreOpen = (e.target as HTMLDetailsElement).open)}>
                <summary>More properties (${more.length})</summary>
                ${more.map((p) => this.field(p, node[p.name]))}
            </details>` : ''}

            ${rich.length ? html`<div class="section">Data &amp; behaviour</div>` : ''}
            ${rich.map((p) => this.richField(p, node[p.name]))}

            ${slots.length ? html`<div class="section">Parts</div>
                <div class="slots">${slots.map((p) => html`<button title="Add to ${p.name}"
                    @click=${() => this.fire('slot-add', { key: p.name, ref: p.ref })}>+ ${slotLabel(p.name)}</button>`)}</div>
                <div class="help">${slots.map((p) => `${p.name}: ${Array.isArray(node[p.name]) ? (node[p.name] as unknown[]).length : 0}`).join(' · ')} — select them in Layers</div>` : ''}

            ${extra.length ? html`<div class="section">Other</div>` : ''}
            ${extra.map((k) => this.textField(k, node[k]))}

            ${structural.length ? html`<div class="muted">${structural.map((p) => p.name).join(', ')} — edited on the canvas</div>` : ''}

            <div class="add">
                <input placeholder="add property…" id="newprop" @keydown=${this.onAddKey} />
                <button @click=${this.addProp}>+</button>
            </div>
            <div class="row">
                <button @click=${() => this.move(-1)}>↑ Up</button>
                <button @click=${() => this.move(1)}>↓ Down</button>
                <button class="danger" @click=${this.del}>Delete</button>
            </div>
        `
    }

    /**
     * The datalist a reference prop picks from, or null for a plain field: a `Partial.ref` picks a
     * partial, a `FormField.id` picks a bound data-source field, any `actionId` picks a bound action.
     */
    /** What a reference prop can pick: a partial, a view-model field, an action (the page's own
     *  actions first, then the view model's). Null when the prop is not a reference. */
    private pickerOptionsFor(prop: string): ComboOption[] | null {
        if (this.node?.type === 'Partial' && prop === 'ref') return (this.project?.partials ?? []).map((p) => ({ value: p }))
        // A field / column names a type of the mount's vocabulary (types.yaml): its attributes become
        // the defaults, what the node declares itself wins.
        if ((this.node?.type === 'FormField' || this.node?.type === 'GridColumn') && prop === 'fieldType') {
            return (this.project?.types ?? []).map((t) => ({
                value: t.id,
                hint: [t.dataType, t.stereotype].filter((v) => v && v !== 'regular').join(' · ') || 'field type',
            }))
        }
        if (this.node?.type === 'FormField' && prop === 'id') return (this.contract?.fields ?? []).map((f) => ({ value: f, hint: 'view model' }))
        if (prop === 'actionId' || prop.endsWith('ActionId')) {
            return [
                ...this.pageActionIds.map((a) => ({ value: a, hint: 'this page' })),
                ...(this.contract?.actions ?? []).map((a) => ({ value: a, hint: 'view model' })),
            ]
        }
        return null
    }

    /** The mount's routes, each with the page it shows. */
    private get routeOptions(): ComboOption[] {
        return (this.project?.routes ?? []).filter((r) => r.route).map((r) => ({ value: r.route, hint: r.definition ?? r.viewModel }))
    }

    /** A typed editor for a schema-declared prop. */
    private field(p: PropSpec, value: unknown) {
        const req = p.required ? html`<span class="req"> *</span>` : ''
        // References that pick from another file / the data source: partial ref, field id, action id.
        const options = this.pickerOptionsFor(p.name)
        if (options) {
            const renamable = p.name === 'id' && BOUND.has(this.node?.type ?? '') && typeof value === 'string' && value
            return html`
                <label>${p.name}${req}</label>
                <div class="inline">
                    <ve-combo .options=${options} .value=${value == null ? '' : String(value)}
                        @change=${(e: Event) => this.emit(p.name, (e.target as HTMLInputElement).value)}></ve-combo>
                    ${renamable ? html`<button title="Rename this binding and every reference to it on the page"
                        @click=${() => this.fire('binding-rename', { from: value })}>Rename…</button>` : ''}
                </div>`
        }
        if (p.kind === 'boolean') {
            return html`<div class="check">
                <input type="checkbox" .checked=${value === true}
                    @change=${(e: Event) => this.emit(p.name, (e.target as HTMLInputElement).checked ? true : '')} />
                ${p.name}${req}
            </div>`
        }
        if (p.kind === 'enum') {
            return html`
                <label>${p.name}${req}</label>
                <select @change=${(e: Event) => this.emit(p.name, (e.target as HTMLSelectElement).value)}>
                    <option value="" ?selected=${value == null || value === ''}></option>
                    ${(p.values ?? []).map((v) => html`<option value=${v} ?selected=${value === v}>${v}</option>`)}
                </select>`
        }
        const type = p.kind === 'number' ? 'number' : 'text'
        if (p.name === 'id' && BOUND.has(this.node?.type ?? '') && typeof value === 'string' && value) {
            return html`
                <label>${p.name}${req}</label>
                <div class="inline">
                    <input .value=${value} @change=${(e: Event) => this.emitTyped(p, (e.target as HTMLInputElement).value)} />
                    <button title="Rename this binding and every reference to it on the page"
                        @click=${() => this.fire('binding-rename', { from: value })}>Rename…</button>
                </div>`
        }
        return html`
            <label>${p.name}${req}</label>
            <input type=${type} .value=${value == null ? '' : String(value)}
                @change=${(e: Event) => this.emitTyped(p, (e.target as HTMLInputElement).value)} />`
    }

    /** Editors for the complex shapes authors touch most (see the class comment). */
    private richField(p: PropSpec, value: unknown) {
        if (p.ref === 'RestDataSource') {
            const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
            const sources = this.project?.sources ?? []
            const ref = typeof v.ref === 'string' ? v.ref : ''
            const url = typeof v.url === 'string' ? v.url : ''
            return html`
                <label>${p.name} <span class="muted-inline">(REST source)</span></label>
                <select @change=${(e: Event) => {
                    const name = (e.target as HTMLSelectElement).value
                    this.emit(p.name, name ? { ...omitKeys(v, ['url']), ref: name } : (url ? omitKeys(v, ['ref']) : ''))
                }}>
                    <option value="" ?selected=${!ref}>${sources.length ? '— inline url —' : '— no sources.yaml —'}</option>
                    ${sources.map((s) => html`<option value=${s.name} ?selected=${s.name === ref} title=${s.description ?? ''}>${s.name}</option>`)}
                    ${ref && !sources.some((s) => s.name === ref) ? html`<option value=${ref} selected>${ref} (unknown)</option>` : ''}
                </select>
                ${ref ? '' : html`<input placeholder="https://api.example.com/items" .value=${url}
                    @change=${(e: Event) => {
                        const u = (e.target as HTMLInputElement).value.trim()
                        this.emit(p.name, u ? { ...v, url: u } : '')
                    }} />`}`
        }
        if (p.ref === 'Actionable') {
            const v = (value && typeof value === 'object' ? value : undefined) as Record<string, unknown> | undefined
            const editable = !v || v.type === 'RouteLink'
            return html`
                <label>On click: navigate to</label>
                ${editable ? html`
                    <ve-combo .options=${this.routeOptions} placeholder="route (e.g. people/new) — empty: run its action"
                        .value=${typeof v?.route === 'string' ? v.route : ''}
                        @change=${(e: Event) => {
                            const r = (e.target as HTMLInputElement).value.trim()
                            this.emit(p.name, r ? { ...(v ?? {}), type: 'RouteLink', route: r } : '')
                        }}></ve-combo>`
                    : html`<div class="help">a ${String(v?.type)} — edit it in YAML</div>`}`
        }
        if (p.kind === 'children' && p.ref === 'Option') {
            const opts = Array.isArray(value) ? (value as Record<string, unknown>[]) : []
            return html`
                <label>${p.name} <span class="muted-inline">(value=Label, …)</span></label>
                <input .value=${opts.map((o) => (o.label != null && o.label !== o.value ? `${o.value}=${o.label}` : String(o.value ?? ''))).join(', ')}
                    placeholder="draft=Draft, sent=Sent"
                    @change=${(e: Event) => this.emit(p.name, parseOptions((e.target as HTMLInputElement).value))} />`
        }
        return this.textField(p.name, value)
    }

    private fire(name: string, detail: unknown) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))
    }

    private textField(key: string, value: unknown) {
        const options = this.pickerOptionsFor(key)
        return html`
            <label>${key}</label>
            ${options
                ? html`<ve-combo .options=${options} .value=${value == null ? '' : String(value)}
                    @change=${(e: Event) => this.emit(key, coerce((e.target as HTMLInputElement).value))}></ve-combo>`
                : html`<input .value=${value == null ? '' : String(value)}
                    @change=${(e: Event) => this.emit(key, coerce((e.target as HTMLInputElement).value))} />`}`
    }

    private emitTyped(p: PropSpec, raw: string) {
        this.emit(p.name, p.kind === 'number' ? (raw === '' ? '' : Number(raw)) : raw)
    }

    private emit(key: string, value: unknown) {
        this.dispatchEvent(new CustomEvent('prop-changed', { detail: { key, value }, bubbles: true, composed: true }))
    }

    private onAddKey(e: KeyboardEvent) {
        if (e.key === 'Enter') this.addProp()
    }

    private addProp() {
        const input = this.renderRoot.querySelector('#newprop') as HTMLInputElement | null
        const key = input?.value.trim()
        if (!key) return
        input!.value = ''
        this.emit(key, '')
    }

    private move(delta: number) {
        this.dispatchEvent(new CustomEvent('node-move', { detail: { delta }, bubbles: true, composed: true }))
    }

    private del() {
        this.dispatchEvent(new CustomEvent('node-delete', { bubbles: true, composed: true }))
    }
}

/** Per component, the properties shown before "More properties" (anything already set also shows). */
const COMMON: Record<string, string[]> = {
    FormField: ['id', 'fieldType', 'label', 'dataType', 'stereotype', 'required', 'readOnly', 'placeholder', 'description', 'colspan'],
    GridColumn: ['id', 'fieldType', 'label', 'dataType', 'stereotype', 'align', 'width', 'identifier', 'sortable'],
    Button: ['label', 'actionId', 'buttonStyle', 'color', 'variant', 'iconOnLeft', 'disabled'],
    Listing: ['title', 'subtitle', 'searchable', 'pageSize', 'rowRoute', 'rowsSelectionEnabled', 'gridLayout', 'filtersLayout'],
    Form: ['title', 'subtitle', 'readOnly'],
    Text: ['text', 'container'],
    FormLayout: ['maxColumns', 'columnWidth', 'labelsAside', 'autoResponsive'],
    VerticalLayout: ['spacing', 'padding', 'fullWidth', 'horizontalAlignment'],
    HorizontalLayout: ['spacing', 'padding', 'wrap', 'justification', 'verticalAlignment'],
    Card: ['title', 'subtitle', 'variants'],
    FormSection: ['title'],
    Tab: ['label', 'routeKey', 'badge', 'active'],
    TabLayout: ['variant', 'orientation'],
}

/** Complex prop types with a dedicated editor. */
const RICH = new Set(['RestDataSource', 'Actionable'])

/** Components whose `id` is a data binding (renaming it should carry its references along). */
const BOUND = new Set(['FormField', 'GridColumn'])

function slotLabel(key: string): string {
    const singular: Record<string, string> = {
        columns: 'column', filters: 'filter', toolbar: 'toolbar button', buttons: 'button', tabs: 'tab',
        groupActions: 'group action', panels: 'panel', rows: 'row', items: 'item', header: 'header item',
        footer: 'footer item', metrics: 'metric', avatars: 'avatar', badges: 'badge', children: 'child',
        main: 'main item', aside: 'aside item', widgets: 'widget',
    }
    return singular[key] ?? key
}

function omitKeys(o: Record<string, unknown>, keys: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(o)) if (!keys.includes(k)) out[k] = o[k]
    return out
}

/** `a=Alpha, b` → [{value:'a', label:'Alpha'}, {value:'b', label:'b'}]; '' clears. */
export function parseOptions(text: string): Record<string, unknown>[] | '' {
    const out = text.split(',').map((s) => s.trim()).filter(Boolean).map((pair) => {
        const eq = pair.indexOf('=')
        const value = eq >= 0 ? pair.slice(0, eq).trim() : pair
        const label = eq >= 0 ? pair.slice(eq + 1).trim() : pair
        return { value, label }
    })
    return out.length ? out : ''
}

/** Coerce obvious booleans/numbers so `spacing: true` stays a boolean in YAML, not a string. */
function coerce(value: string): unknown {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value !== '' && !isNaN(Number(value)) && /^-?\d+(\.\d+)?$/.test(value)) return Number(value)
    return value
}

declare global {
    interface HTMLElementTagNameMap { 'editor-properties': EditorProperties }
}
