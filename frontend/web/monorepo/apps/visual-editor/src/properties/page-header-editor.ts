import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { panelStyles } from './panelStyles'
import {
    asList, asObj, objectWith, listAdd, listRemove, listWith, listMove, parseOptions, formatOptions,
    optionsModeOf, withOptionsMode, switcherNavOf, withSwitcherNav, BADGE_COLORS, BANNER_THEMES, BUTTON_STYLES,
    type Obj,
} from '../model/headerProps'
import type { PageNode } from '../model/pageModel'
import type { ProjectIndex } from '../model/projectIndex'
import type { ComboOption } from '../widgets/comboModel'
import '../widgets/ve-select'
import '../widgets/ve-combo'
import '../widgets/ve-icon-picker'
import '../widgets/ve-source-picker'

/**
 * The "Page header" section of the Properties pane, for a `type: Form` node: what a Java page gets
 * from its annotations and suppliers (`@Overline`, `@BadgeInHeader`, `@KPI`, `@Banner`, `@Fab`,
 * `PeerNavigationSupplier`, `RecordSwitcherSupplier`…), authored as data — overline, title
 * placeholder, timestamp, badges, KPIs, banners, FABs, previous/next and the record switcher.
 *
 * Every edit emits the WHOLE new value of one key as `prop-changed` {key, value} — the pane's own
 * contract, so the page model and the minimal YAML write path apply it like any other property; a
 * value of `''` removes the key. List rows keep the keys this editor does not model.
 */
@customElement('page-header-editor')
export class PageHeaderEditor extends LitElement {
    static styles = [panelStyles, css`
        /* a section of the pane, not a pane: no own height, scroller or border */
        :host { height: auto; overflow: visible; border-left: none; background: transparent; }
        .item { margin: 0.25rem 0.75rem 0.4rem; padding: 0.35rem 0 0.15rem; border: 1px solid var(--ve-border); border-radius: 6px;
                background: var(--ve-base); }
        .item .inline { margin: 0.1rem 0.5rem 0.3rem; }
        .item label { padding: 0.15rem 0.5rem 0; }
        .item .check { padding: 0.15rem 0.5rem 0.3rem; }
        .item ve-icon-picker, .item ve-combo, .item ve-source-picker { margin: 0.1rem 0.5rem 0.3rem; }
        .item input, .item ve-select { width: calc(100% - 1rem); margin: 0.1rem 0.5rem 0.3rem; }
        .inline input, .inline ve-select { margin: 0; width: auto; }
        .row-head { display: flex; align-items: center; gap: 0.3rem; padding: 0 0.5rem; }
        .row-head .kind { flex: 1; font: 600 10px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .04em; color: var(--ve-tertiary); }
        button.mini { padding: 0.15rem 0.45rem; font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border);
                      border-radius: 6px; background: var(--ve-base); color: inherit; cursor: pointer; }
        button.mini.del { color: var(--ve-error); border-color: var(--ve-error-border); }
        button.mini:disabled { opacity: .4; cursor: default; }
        button.add-item { margin: 0.1rem 0.75rem 0.4rem; padding: 0.25rem 0.6rem; font: 12px var(--ve-font, system-ui);
                          border: 1px dashed var(--ve-input-border); border-radius: 6px; background: transparent; color: inherit; cursor: pointer; }
        ve-source-picker { margin: 0.1rem 0.75rem 0.35rem; }
        ve-combo { font: 13px var(--ve-font, system-ui); }
    `]

    @property({ attribute: false }) node: PageNode | null = null
    @property({ attribute: false }) project?: ProjectIndex
    /** What a FAB / the record switcher can run: the page's own actions, the view model's, the catalogue's. */
    @property({ attribute: false }) actionOptions: ComboOption[] = []
    /** The mount's routes (previous/next, the switcher's target). */
    @property({ attribute: false }) routeOptions: ComboOption[] = []
    @property() renderer = 'vaadin'

    render() {
        const n = this.node
        if (!n) return ''
        return html`
            <div class="section">Page header</div>
            ${this.text('overline', 'the quiet line above the title')}
            ${this.text('titlePlaceholder', 'shown while the title is empty, e.g. New customer…')}
            ${this.text('timestamp', 'the "last updated" line, e.g. Updated ${state.updatedAt}')}
            ${this.group('badges', 'Badges', html`
                ${asList(n.badges).map((b, i) => this.row('badges', i, 'Badge', html`
                    <div class="inline">
                        <input placeholder="label (e.g. \${state.status})" aria-label="Badge label" .value=${str(b.label)}
                            @change=${(e: Event) => this.item('badges', i, { label: val(e) })} />
                        ${this.select(['', ...BADGE_COLORS], str(b.color), (v) => this.item('badges', i, { color: v }), 'Badge color', 'color')}
                    </div>`))}
                ${this.addBtn('badges', '+ Badge', { label: 'Badge', color: 'success' })}`)}
            ${this.group('kpis', 'KPIs', html`
                ${asList(n.kpis).map((k, i) => this.row('kpis', i, 'KPI', html`
                    <div class="inline">
                        <input placeholder="label" aria-label="KPI label" .value=${str(k.label)} @change=${(e: Event) => this.item('kpis', i, { label: val(e) })} />
                        <input placeholder="value (e.g. \${state.balance})" aria-label="KPI value" .value=${str(k.value)}
                            @change=${(e: Event) => this.item('kpis', i, { value: val(e) })} />
                    </div>`))}
                ${this.addBtn('kpis', '+ KPI', { label: 'Label', value: 'Value' })}`)}
            ${this.group('banners', 'Banners', html`
                ${asList(n.banners).map((b, i) => this.row('banners', i, 'Banner', html`
                    ${this.select(BANNER_THEMES, str(b.theme) || 'INFO', (v) => this.item('banners', i, { theme: v }), 'Banner theme')}
                    <input placeholder="title" aria-label="Banner title" .value=${str(b.title)} @change=${(e: Event) => this.item('banners', i, { title: val(e) })} />
                    <input placeholder="description" aria-label="Banner description" .value=${str(b.description)}
                        @change=${(e: Event) => this.item('banners', i, { description: val(e) })} />
                    <div class="inline">
                        <label class="check" style="padding:0"><input type="checkbox" style="width:auto;margin:0" .checked=${b.closeable === true}
                            @change=${(e: Event) => this.item('banners', i, { closeable: checked(e) })} /> closeable</label>
                        <input type="number" min="0" placeholder="timeout (s)" aria-label="Banner timeout seconds" .value=${str(b.timeoutSeconds)}
                            @change=${(e: Event) => this.item('banners', i, { timeoutSeconds: num(e) })} />
                    </div>`))}
                ${this.addBtn('banners', '+ Banner', { theme: 'INFO', title: 'Title' })}`)}
            ${this.group('fabs', 'Floating buttons (FABs)', html`
                ${asList(n.fabs).map((f, i) => this.row('fabs', i, 'FAB', html`
                    <ve-icon-picker .renderer=${this.renderer} .value=${str(f.icon)} placeholder="icon"
                        @change=${(e: Event) => this.item('fabs', i, { icon: val(e) })}></ve-icon-picker>
                    <input placeholder="label" aria-label="FAB label" .value=${str(f.label)} @change=${(e: Event) => this.item('fabs', i, { label: val(e) })} />
                    <ve-combo placeholder="actionId" .options=${this.actionOptions} .value=${str(f.actionId)}
                        empty-text="No actions yet — declare one in the page's Actions or the catalogue"
                        @change=${(e: Event) => this.item('fabs', i, { actionId: val(e) })}></ve-combo>
                    <div class="inline">
                        <input type="number" placeholder="order" aria-label="FAB order" .value=${str(f.order)} @change=${(e: Event) => this.item('fabs', i, { order: num(e) })} />
                        ${this.select(['', ...BUTTON_STYLES], str(f.buttonStyle), (v) => this.item('fabs', i, { buttonStyle: v }), 'FAB button style', 'primary')}
                    </div>`))}
                ${this.addBtn('fabs', '+ FAB', { icon: 'vaadin:plus', label: 'New', actionId: this.actionOptions[0]?.value ?? 'actionId' })}`)}
            ${this.peerNav(asObj(n.peerNav))}
            ${this.switcher(n.recordSwitcher)}`
    }

    // --- groups ---

    private peerNav(p: Obj) {
        const cur = () => this.node?.peerNav
        const side = (which: 'prev' | 'next', title: string) => html`
            <label>${title}</label>
            <div class="inline">
                <input placeholder="label" aria-label="${title} label" .value=${str(p[which + 'Label'])}
                    @change=${(e: Event) => this.set('peerNav', objectWith(cur(), { [which + 'Label']: val(e) }))} />
                <ve-combo placeholder="route (e.g. customers/\${state.${which}Id})" .options=${this.routeOptions} .value=${str(p[which + 'Route'])}
                    @change=${(e: Event) => this.set('peerNav', objectWith(cur(), { [which + 'Route']: val(e) }))}></ve-combo>
            </div>`
        return html`<details class="more" ?open=${Object.keys(p).length > 0}>
            <summary>Previous / next${Object.keys(p).length ? ' ✓' : ''}</summary>
            ${side('prev', 'Previous')}
            ${side('next', 'Next')}
        </details>`
    }

    private switcher(raw: unknown) {
        const s = asObj(raw)
        const cur = () => this.node?.recordSwitcher
        const set = (patch: Obj) => this.set('recordSwitcher', objectWith(cur(), patch))
        const mode = optionsModeOf(s)
        const nav = switcherNavOf(s)
        const firstSource = this.project?.sources?.[0]?.name
        return html`<details class="more" ?open=${Object.keys(s).length > 0}>
            <summary>Record switcher${Object.keys(s).length ? ' ✓' : ''}</summary>
            <div class="help">A selector in the header that jumps to another record.</div>
            <label>label</label>
            <input .value=${str(s.label)} placeholder="e.g. Customer" @change=${(e: Event) => set({ label: val(e) })} />
            <label>value <span class="muted-inline">— the current record</span></label>
            <input .value=${str(s.value)} placeholder="\${state.id}" @change=${(e: Event) => set({ value: val(e) })} />
            <label>type</label>
            ${this.select(['', 'object', 'context'], str(s.type), (v) => set({ type: v }), 'Switcher type', 'object')}
            <div class="check"><input type="checkbox" .checked=${s.searchable === true} @change=${(e: Event) => set({ searchable: checked(e) })} /> searchable</div>
            <div class="check"><input type="checkbox" .checked=${s.disabled === true} @change=${(e: Event) => set({ disabled: checked(e) })} /> disabled</div>
            <label>entries</label>
            ${this.select(['options', 'source'], mode, (v) => this.set('recordSwitcher',
                withOptionsMode(cur(), v as 'options' | 'source', firstSource ? { ref: firstSource } : {})), 'Switcher entries', '',
                { options: 'listed options', source: 'from a REST source' })}
            ${mode === 'source'
                ? html`<ve-source-picker class="switcher-source" .sources=${this.project?.sources ?? []} .value=${s.optionsSource}
                    @change=${(e: Event) => set({ optionsSource: (e.target as unknown as { value: unknown }).value || {} })}></ve-source-picker>`
                : html`<input class="switcher-options" placeholder="c1=Acme, c2=Globex" aria-label="Switcher options" .value=${formatOptions(s.options)}
                    @change=${(e: Event) => set({ options: parseOptions(val(e)) })} />`}
            <label>on pick</label>
            ${this.select(['route', 'action'], nav, (v) => this.set('recordSwitcher', withSwitcherNav(cur(), v as 'route' | 'action')), 'Switcher on pick', '',
                { route: 'navigate to a route', action: 'run an action' })}
            ${nav === 'route'
                ? html`<ve-combo class="switcher-route" placeholder="customers/\${state._record}" .options=${this.routeOptions} .value=${str(s.route)}
                    @change=${(e: Event) => set({ route: val(e) })}></ve-combo>`
                : html`<ve-combo class="switcher-action" placeholder="_switchRecord" .options=${this.actionOptions} .value=${str(s.actionId)}
                    @change=${(e: Event) => set({ actionId: val(e) })}></ve-combo>`}
        </details>`
    }

    // --- building blocks ---

    private text(key: string, help: string) {
        return html`
            <label>${key} <span class="muted-inline">— ${help}</span></label>
            <input class=${key} .value=${str(this.node?.[key])} @change=${(e: Event) => this.set(key, val(e))} />`
    }

    private group(key: string, title: string, body: unknown) {
        const count = asList(this.node?.[key]).length
        return html`<details class="more" ?open=${count > 0} data-key=${key}>
            <summary>${title}${count ? ` (${count})` : ''}</summary>
            ${body}
        </details>`
    }

    private row(key: string, i: number, kind: string, body: unknown) {
        const size = asList(this.node?.[key]).length
        return html`<div class="item" data-index=${i}>
            <div class="row-head">
                <span class="kind">${kind} ${i + 1}</span>
                <button class="mini" title="Move up" ?disabled=${i === 0} @click=${() => this.set(key, listMove(this.node?.[key], i, -1))}>↑</button>
                <button class="mini" title="Move down" ?disabled=${i === size - 1} @click=${() => this.set(key, listMove(this.node?.[key], i, 1))}>↓</button>
                <button class="mini del" title="Remove" @click=${() => this.set(key, listRemove(this.node?.[key], i))}>✕</button>
            </div>
            ${body}
        </div>`
    }

    private addBtn(key: string, label: string, seed: Obj) {
        return html`<button class="add-item" data-add=${key} @click=${() => this.set(key, listAdd(this.node?.[key], seed))}>${label}</button>`
    }

    /** A ve-select over `values`; `''` shows as `emptyLabel` (the default the runtime applies). */
    private select(values: readonly string[], current: string, onPick: (v: string) => void, aria: string, emptyLabel = '—',
        labels: Record<string, string> = {}) {
        return html`<ve-select aria-label=${aria} @change=${(e: Event) => onPick((e.target as HTMLSelectElement).value)}>
            ${values.map((v) => html`<option value=${v} ?selected=${v === current}>${v ? (labels[v] ?? v) : emptyLabel}</option>`)}
            ${current && !values.includes(current) ? html`<option value=${current} selected>${current} (unknown)</option>` : ''}
        </ve-select>`
    }

    private item(key: string, i: number, patch: Obj) {
        this.set(key, listWith(this.node?.[key], i, patch))
    }

    /**
     * Handlers read the node's CURRENT value when they fire, never one captured at render: the pane's
     * host applies a `prop-changed` to the node synchronously, so two edits landing before the pane
     * re-renders (one field's change on blur, the next control's in the same tick) both survive.
     */
    private set(key: string, value: unknown) {
        this.dispatchEvent(new CustomEvent('prop-changed', { detail: { key, value }, bubbles: true, composed: true }))
    }
}

const str = (v: unknown) => (v == null ? '' : String(v))
const val = (e: Event) => (e.target as HTMLInputElement).value.trim()
const checked = (e: Event) => (e.target as HTMLInputElement).checked
const num = (e: Event) => {
    const raw = (e.target as HTMLInputElement).value.trim()
    return raw === '' || isNaN(Number(raw)) ? '' : Number(raw)
}

declare global {
    interface HTMLElementTagNameMap { 'page-header-editor': PageHeaderEditor }
}
