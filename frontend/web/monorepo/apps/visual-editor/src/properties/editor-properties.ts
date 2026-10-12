import { LitElement, html } from 'lit'
import { panelStyles } from './panelStyles'
import '../widgets/ve-combo'
import '../widgets/ve-access'
import '../widgets/ve-image-picker'
import '../widgets/ve-icon-picker'
import { isIconProp } from '../model/iconCatalog'
import { PAGE_TYPES, PAGE_TYPE_LABELS } from '../model/pageType'
import { isImageProp, type ProjectImage } from '../model/projectImages'
import { COMPONENT_ACCESS_KEYS, restricts } from '../model/access'
import { translationKeys } from '../model/translationsModel'
import type { ComboOption } from '../widgets/comboModel'
import { customElement, property, state } from 'lit/decorators.js'
import { PageNode, scalarProps } from '../model/pageModel'
import { PropSpec, slotProps } from '../model/componentSchema'
import { specFor } from '../model/schemaCatalog'
import { catalogueActionOptions, type ProjectIndex } from '../model/projectIndex'
import type { ContractMembers } from '../model/contract'
import '../widgets/ve-select'
import '../widgets/ve-source-picker'
import './page-header-editor'
import { PAGE_HEADER_KEYS, parseOptions } from '../model/headerProps'

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
    static styles = panelStyles

    @property({ attribute: false }) node: PageNode | null = null
    @property({ attribute: false }) project?: ProjectIndex
    @property({ attribute: false }) contract?: ContractMembers
    /** The ids of the actions this page declares (its `actions:` — REST calls and flows). */
    @property({ attribute: false }) pageActionIds: string[] = []
    /** The project's images (from the host), for the image properties' picker. */
    @property({ attribute: false }) images: readonly ProjectImage[] = []
    /** Whether the host can copy a new image into the project ("Add image to project…"). */
    @property({ type: Boolean }) canAddImage = false
    /** The project's renderer: the icon pickers offer the icons it paints. */
    @property() renderer = 'vaadin'
    /**
     * Set when the selected node is the PAGE (the definition's root): its page-level settings — today
     * `pageType`, the YAML twin of @PageTemplate — show above its properties. `undefined` = not the page.
     */
    @property({ attribute: false }) page?: { pageType?: string }
    @state() private moreOpen = false

    render() {
        const node = this.node
        if (!node) return html`<div class="title">Properties</div><div class="empty">Select a component on the canvas.</div>`

        const spec = specFor(node.type)
        // A page's header (a Form's overline, badges, KPIs, banners, FABs, previous/next, switcher) has
        // its own section; those keys are not repeated among the generic properties.
        const header = node.type === 'Form' ? HEADER_KEYS : NO_KEYS
        // Scalar props the schema declares for this component (typed editors).
        // `note` (the design note) has its own box at the top, not a row among the properties.
        const known = spec ? spec.props.filter((p) => p.kind !== 'children' && p.kind !== 'complex' && p.name !== 'note' && !header.has(p.name)) : []
        // Complex props with a dedicated editor (data sources, navigation, options).
        const rich = spec ? spec.props.filter((p) => RICH.has(p.ref ?? '') || (p.kind === 'children' && p.ref === 'Option')) : []
        const slots = slotProps(spec)
        const richNames = new Set([...rich, ...slots].map((p) => p.name))
        const structural = spec ? spec.props.filter((p) => (p.kind === 'children' || p.kind === 'complex') && !richNames.has(p.name) && p.name !== 'content' && p.ref !== 'Access' && !header.has(p.name)) : []
        // The props an author reaches for first stay in view; the long tail (a FormField has ~50) folds
        // under "More properties" — always including anything already set on the node.
        const common = new Set(COMMON[node.type] ?? known.slice(0, 8).map((p) => p.name))
        const isPrimary = (p: PropSpec) => common.has(p.name) || p.required || node[p.name] !== undefined
        const primary = known.filter(isPrimary)
        const more = known.filter((p) => !isPrimary(p))
        const knownNames = new Set([...known.map((p) => p.name), ...richNames, ...structural.map((p) => p.name), ...ACCESS_KEYS, ...header])
        // Props on the node the schema does not know (hand-authored, or a newer catalog) — keep editable.
        const extra = scalarProps(node).filter((k) => k !== 'note' && !knownNames.has(k) && !(this.page && PAGE_KEYS.has(k))
            && (node[k] == null || typeof node[k] !== 'object'))

        return html`
            <div class="title">Properties</div>
            <div class="type">${node.type}${spec ? '' : ' (unknown)'}</div>
            <label for="ve-note">Note <span class="muted-inline">— what this should do; goes in the view-model prompt, never rendered</span></label>
            <textarea id="ve-note" class="note" rows="2" placeholder="e.g. must be unique · only managers can change it"
                .value=${typeof node.note === 'string' ? node.note : ''}
                @change=${(e: Event) => this.fire('prop-changed', { key: 'note', value: (e.target as HTMLTextAreaElement).value.trim() })}></textarea>

            ${this.page ? this.pageSection(this.page) : ''}

            ${known.length ? html`<div class="section">Properties</div>` : ''}
            ${primary.map((p) => this.field(p, node[p.name]))}
            ${more.length ? html`<details class="more" ?open=${this.moreOpen}
                    @toggle=${(e: Event) => (this.moreOpen = (e.target as HTMLDetailsElement).open)}>
                <summary>More properties (${more.length})</summary>
                ${more.map((p) => this.field(p, node[p.name]))}
            </details>` : ''}

            ${node.type === 'Form' ? html`<page-header-editor .node=${node} .project=${this.project} .renderer=${this.renderer}
                .actionOptions=${this.pickerOptionsFor('actionId') ?? []} .routeOptions=${this.routeOptions}></page-header-editor>` : ''}

            ${rich.length ? html`<div class="section">Data &amp; behaviour</div>` : ''}
            ${rich.map((p) => this.richField(p, node[p.name]))}

            ${slots.length ? html`<div class="section">Parts</div>
                <div class="slots">${slots.map((p) => html`<button title="Add to ${p.name}"
                    @click=${() => this.fire('slot-add', { key: p.name, ref: p.ref })}>+ ${slotLabel(p.name)}</button>`)}</div>
                <div class="help">${slots.map((p) => `${p.name}: ${Array.isArray(node[p.name]) ? (node[p.name] as unknown[]).length : 0}`).join(' · ')} — select them in Layers</div>` : ''}

            ${this.accessSection(node)}

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
        const i18n = this.translationOptions(prop)
        if (i18n) return i18n
        if (prop === 'actionId' || prop.endsWith('ActionId')) {
            return [
                ...this.pageActionIds.map((a) => ({ value: a, hint: 'this page' })),
                ...(this.contract?.actions ?? []).map((a) => ({ value: a, hint: 'view model' })),
                // then the shared catalogue — the page's own action of the same id wins at runtime
                ...catalogueActionOptions(this.project, this.pageActionIds),
            ]
        }
        return null
    }

    /**
     * The page's own settings, shown when the root is selected. `pageType` is the coarse page family
     * (the YAML twin of Java's @PageTemplate): the renderers infer it from the page's shape, so the
     * empty choice — "inferred" — is the default and writes nothing.
     */
    private pageSection(page: { pageType?: string }) {
        const current = typeof page.pageType === 'string' ? page.pageType : ''
        const known = (PAGE_TYPES as readonly string[]).includes(current)
        return html`
            <div class="section">Page</div>
            <label>pageType <span class="muted-inline">— the page family; inferred from its content when empty</span></label>
            <ve-select class="page-type" @change=${(e: Event) => this.fire('page-prop-changed', { key: 'pageType', value: (e.target as HTMLSelectElement).value })}>
                <option value="" ?selected=${!current}>inferred</option>
                ${PAGE_TYPES.map((t) => html`<option value=${t} ?selected=${t === current} title=${PAGE_TYPE_LABELS[t]}>${t}</option>`)}
                ${current && !known ? html`<option value=${current} selected>${current} (unknown)</option>` : ''}
            </ve-select>`
    }

    /**
     * Who may see / edit / use this component: `eyesOnly`, `readOnlyUnless`, `disabledUnless` (the
     * YAML twins of the annotations). Decided on the server per request; cosmetic in Play.
     */
    private accessSection(node: PageNode) {
        const declared = COMPONENT_ACCESS_KEYS.filter((k) => restricts(node[k.key]))
        return html`
            <details class="more" ?open=${declared.length > 0}>
                <summary>Access${declared.length ? ` (${declared.map((k) => k.key).join(', ')})` : ''}</summary>
                <div class="help">Roles, groups, scopes or permissions from the caller's token — one of each listed dimension. Checked on the server; with no server (Play, a static bundle) it is cosmetic.</div>
                ${COMPONENT_ACCESS_KEYS.map((k) => html`
                    <label>${k.label} <span class="muted-inline">— ${k.key}: ${k.help}</span></label>
                    <ve-access style="margin: 0.1rem 0.75rem 0.4rem" .value=${node[k.key]}
                        @change=${(e: Event) => this.emit(k.key, (e.target as unknown as { value: unknown }).value)}></ve-access>`)}
            </details>`
    }

    /** `${i18n.key}` suggestions for a text prop (label, title…), from the project's catalogues. */
    private translationOptions(prop: string): ComboOption[] | null {
        if (!TRANSLATABLE.has(prop)) return null
        const files = this.project?.translations ?? []
        if (!files.length) return null
        const first = files[0]
        return translationKeys(files).map((k) => ({ value: '${i18n.' + k + '}', label: k, hint: first.messages[k] }))
    }

    /** The mount's routes, each with the page it shows. */
    private get routeOptions(): ComboOption[] {
        return (this.project?.routes ?? []).filter((r) => r.route).map((r) => ({ value: r.route, hint: r.definition ?? r.viewModel }))
    }

    /** A typed editor for a schema-declared prop. */
    private field(p: PropSpec, value: unknown) {
        const req = p.required ? html`<span class="req"> *</span>` : ''
        if (isImageProp(p.name, p)) return this.imageField(p.name, value, req)
        if (isIconProp(p.name, p)) return this.iconField(p.name, value, req)
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
                <ve-select @change=${(e: Event) => this.emit(p.name, (e.target as HTMLSelectElement).value)}>
                    <option value="" ?selected=${value == null || value === ''}></option>
                    ${(p.values ?? []).map((v) => html`<option value=${v} ?selected=${value === v}>${v}</option>`)}
                </ve-select>`
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
            return html`
                <label>${p.name} <span class="muted-inline">(REST source)</span></label>
                <ve-source-picker style="margin: 0.1rem 0.75rem 0.35rem" .sources=${this.project?.sources ?? []} .value=${value}
                    @change=${(e: Event) => this.emit(p.name, (e.target as unknown as { value: unknown }).value)}></ve-source-picker>`
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

    /** An image property: free text plus the project's images (see ve-image-picker). */
    private imageField(key: string, value: unknown, req: unknown = '') {
        return html`
            <label>${key}${req}</label>
            <ve-image-picker .images=${this.images} ?can-add=${this.canAddImage} .value=${value == null ? '' : String(value)}
                @change=${(e: Event) => this.emit(key, (e.target as HTMLInputElement).value)}></ve-image-picker>`
    }

    /** An icon property: free text plus a searchable picker of the renderer's icons (see ve-icon-picker). */
    private iconField(key: string, value: unknown, req: unknown = '') {
        return html`
            <label>${key}${req}</label>
            <ve-icon-picker .renderer=${this.renderer} .value=${value == null ? '' : String(value)}
                @change=${(e: Event) => this.emit(key, (e.target as HTMLInputElement).value)}></ve-icon-picker>`
    }

    private textField(key: string, value: unknown) {
        if (isImageProp(key) && (value == null || typeof value === 'string')) return this.imageField(key, value)
        if (isIconProp(key) && (value == null || typeof value === 'string')) return this.iconField(key, value)
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

/** Page-level keys edited in the Page section (not repeated under "Other" when they sit on a bare root). */
const PAGE_KEYS = new Set(['pageType'])

/** The page header keys of a Form, edited by page-header-editor. */
const HEADER_KEYS: ReadonlySet<string> = new Set(PAGE_HEADER_KEYS)
const NO_KEYS: ReadonlySet<string> = new Set()

/** The access overlay keys every component accepts (edited in the Access section). */
const ACCESS_KEYS = COMPONENT_ACCESS_KEYS.map((k) => k.key)

/** Text props that may carry a `${i18n.key}` — offered the project's translation keys. */
const TRANSLATABLE = new Set(['label', 'title', 'subtitle', 'text', 'placeholder', 'description', 'headerTitle',
    'actionLabel', 'emptyStateMessage', 'overline', 'header', 'footer', 'caption', 'helperText', 'pageTitle'])

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

/** Kept exported from here for the callers that imported it with the pane. */
export { parseOptions }

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
