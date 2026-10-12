import { LitElement, html, css, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
    asList, asObj, objectWith, listAdd, listRemove, listWith, listSet, listMove, parseOptions, formatOptions,
    optionsModeOf, withOptionsMode, headerActionKind, headerActionKindWith, headerActionWith, headerActionAdd,
    headerActionRemove, type ActionPath, type HeaderActionKind, type Obj,
} from '../model/headerProps'
import type { SourceEntry } from '../model/projectIndex'
import type { ComboOption } from '../widgets/comboModel'
import '../widgets/ve-select'
import '../widgets/ve-combo'
import '../widgets/ve-icon-picker'
import '../widgets/ve-source-picker'

/**
 * The "Header extras" of the app-shell editor: what an `@App` class gets from `@AppContext` fields,
 * `AppActionsSupplier`, `NotificationsSupplier` and `GlobalSearchSupplier`, authored on a
 * `type: AppShell` — context selectors (listed options or a REST source), header actions (a route, an
 * action, or a dropdown of children), the notification inbox and the global search (REST sources).
 *
 * `value` holds the four keys as authored; every edit emits `extras-changed` {key, value} with the
 * WHOLE new value of one key (`''` removes it). Keys the editor does not model are kept.
 */
@customElement('app-header-extras')
export class AppHeaderExtras extends LitElement {
    static styles = css`
        :host { display: block; }
        label { display: block; font: 11px var(--ve-font, system-ui); color: var(--ve-secondary); margin: 0.45rem 0 0.1rem; }
        input { width: 100%; padding: 0.4rem 0.5rem; font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border);
                border-radius: 6px; box-sizing: border-box; background: var(--ve-base); color: inherit; }
        ve-select { display: block; font: 13px var(--ve-font, system-ui); --ve-select-radius: 6px; --ve-select-padding: 0.4rem 0.5rem; }
        .item { border: 1px solid var(--ve-border); border-radius: 8px; padding: 0.5rem 0.6rem; margin: 0.4rem 0; background: var(--ve-surface); }
        .kind { font: 600 10px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .04em; color: var(--ve-tertiary); }
        .row { display: flex; gap: 0.4rem; align-items: center; margin-top: 0.3rem; }
        .row > input, .row > ve-combo, .row > ve-source-picker { flex: 1; min-width: 0; }
        .row > ve-select { flex: 0 0 9rem; }
        .row > ve-icon-picker { flex: 0 1 12rem; min-width: 8rem; font: 12px var(--ve-font, system-ui); }
        .sub { margin: 0.4rem 0 0 1rem; padding-left: 0.5rem; border-left: 2px solid var(--ve-border); }
        .grow { flex: 1; }
        .mini { height: 30px; min-width: 30px; border: 1px solid var(--ve-input-border); background: var(--ve-base); color: inherit; border-radius: 6px; cursor: pointer; }
        .mini:disabled { opacity: .4; cursor: default; }
        .del { border-color: var(--ve-error-border); color: var(--ve-error); }
        .adds { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .adds button { padding: 0.35rem 0.7rem; font: 12px var(--ve-font, system-ui); background: var(--ve-base); color: inherit;
                       border: 1px solid var(--ve-input-border); border-radius: 6px; cursor: pointer; }
        .note { color: var(--ve-tertiary); font: 12px var(--ve-font, system-ui); margin-top: 0.4rem; }
        h4 { margin: 0.9rem 0 0.1rem; font: 600 12px var(--ve-font, system-ui); }
    `

    /** The shell's `contextSelectors`, `headerActions`, `notifications` and `globalSearch`, as authored. */
    @property({ attribute: false }) value: Record<string, unknown> = {}
    @property({ attribute: false }) sources: readonly SourceEntry[] = []
    @property({ attribute: false }) routeOptions: ComboOption[] = []
    @property({ attribute: false }) actionOptions: ComboOption[] = []
    @property() renderer = 'vaadin'

    render() {
        const v = this.value ?? {}
        const notifications = asObj(v.notifications)
        return html`
            <h4>Context selectors</h4>
            <div class="note">Pickers on the header that fix a value for every screen (a hotel, a company) — sent with every request as app state.</div>
            ${asList(v.contextSelectors).map((s, i) => this.selector(s, i))}
            <div class="adds"><button data-add="contextSelectors" @click=${() => this.set('contextSelectors',
                listAdd(v.contextSelectors, { fieldName: 'field', label: 'Label', options: [{ value: 'a', label: 'A' }] }))}>+ Context selector</button></div>

            <h4>Header actions</h4>
            <div class="note">Buttons on the header: navigate to a route, run a flow / catalogue action, or open a dropdown of children.</div>
            ${asList(v.headerActions).map((a, i) => this.action(a, [i]))}
            <div class="adds"><button data-add="headerActions" @click=${() => this.set('headerActions', headerActionAdd(v.headerActions, []))}>+ Header action</button></div>

            <h4>Notifications</h4>
            <div class="note">The inbox bell, fed by a REST source; “mark read” is optional (\${state.ids}, \${state.id}, \${state.all}).</div>
            <label>Inbox source</label>
            <ve-source-picker class="notifications-source" .sources=${this.sources} .value=${notifications.source}
                @change=${(e: Event) => this.set('notifications', objectWith(this.value.notifications, { source: valueOf(e) }))}></ve-source-picker>
            <label>Mark-read source</label>
            <ve-source-picker class="notifications-read" .sources=${this.sources} .value=${notifications.markRead}
                @change=${(e: Event) => this.set('notifications', objectWith(this.value.notifications, { markRead: valueOf(e) }))}></ve-source-picker>

            <h4>Global search</h4>
            <div class="note">Entity hits in the ⌘K palette, from a REST source (\${state.searchText} in its url or body).</div>
            <ve-source-picker class="global-search" .sources=${this.sources} .value=${asObj(v.globalSearch).source}
                @change=${(e: Event) => this.set('globalSearch', objectWith(this.value.globalSearch, { source: valueOf(e) }))}></ve-source-picker>`
    }

    private selector(s: Obj, i: number): TemplateResult {
        const list = () => this.value.contextSelectors
        const patch = (p: Obj) => this.set('contextSelectors', listWith(list(), i, p))
        const mode = optionsModeOf(s)
        const firstSource = this.sources[0]?.name
        return html`<div class="item" data-index=${i}>
            <div class="row"><span class="kind grow">Context selector</span>
                <button class="mini" title="Move up" ?disabled=${i === 0} @click=${() => this.set('contextSelectors', listMove(list(), i, -1))}>↑</button>
                <button class="mini" title="Move down" ?disabled=${i === asList(list()).length - 1} @click=${() => this.set('contextSelectors', listMove(list(), i, 1))}>↓</button>
                <button class="mini del" title="Remove" @click=${() => this.set('contextSelectors', listRemove(list(), i))}>✕</button></div>
            <div class="row">
                <input placeholder="fieldName (app-state key)" aria-label="Field name" .value=${str(s.fieldName)} @change=${(e: Event) => patch({ fieldName: val(e) })} />
                <input placeholder="label" aria-label="Selector label" .value=${str(s.label)} @change=${(e: Event) => patch({ label: val(e) })} />
            </div>
            <div class="row">
                <ve-select aria-label="Selector entries" @change=${(e: Event) => this.set('contextSelectors', listSet(list(), i,
                    withOptionsMode(asList(list())[i], (e.target as HTMLSelectElement).value as 'options' | 'source', firstSource ? { ref: firstSource } : {})))}>
                    <option value="options" ?selected=${mode === 'options'}>listed options</option>
                    <option value="source" ?selected=${mode === 'source'}>from a REST source</option>
                </ve-select>
                ${mode === 'source'
                    ? html`<ve-source-picker .sources=${this.sources} .value=${s.optionsSource}
                        @change=${(e: Event) => patch({ optionsSource: valueOf(e) || {} })}></ve-source-picker>`
                    : html`<input class="options" placeholder="H1=Palma, H2=Ibiza" aria-label="Selector options" .value=${formatOptions(s.options)}
                        @change=${(e: Event) => patch({ options: parseOptions(val(e)) })} />`}
            </div>
        </div>`
    }

    private action(a: Obj, path: ActionPath): TemplateResult {
        const list = () => this.value.headerActions
        const kind = headerActionKind(a)
        const set = (p: Obj) => this.set('headerActions', headerActionWith(list(), path, p))
        return html`<div class="item" data-path=${path.join('.')}>
            <div class="row">
                <input placeholder="label" aria-label="Action label" .value=${str(a.label)} @change=${(e: Event) => set({ label: val(e) })} />
                <ve-icon-picker placeholder="icon" .renderer=${this.renderer} .value=${str(a.icon)}
                    @change=${(e: Event) => set({ icon: val(e) })}></ve-icon-picker>
                <button class="mini del" title="Remove" @click=${() => this.set('headerActions', headerActionRemove(list(), path))}>✕</button>
            </div>
            <div class="row">
                <ve-select aria-label="Action kind" @change=${(e: Event) => this.set('headerActions',
                    headerActionKindWith(list(), path, (e.target as HTMLSelectElement).value as HeaderActionKind, this.actionOptions[0]?.value))}>
                    <option value="route" ?selected=${kind === 'route'}>navigate</option>
                    <option value="action" ?selected=${kind === 'action'}>run an action</option>
                    <option value="menu" ?selected=${kind === 'menu'}>dropdown</option>
                </ve-select>
                ${kind === 'route'
                    ? html`<ve-combo class="route" placeholder="route" .options=${this.routeOptions} .value=${str(a.route)}
                        empty-text="No routes yet — add them in a routes file" @change=${(e: Event) => set({ route: val(e) })}></ve-combo>`
                    : kind === 'action'
                    ? html`<ve-combo class="action" placeholder="actionId" .options=${this.actionOptions} .value=${str(a.actionId)}
                        empty-text="No flows yet — add one in Actions or in an action catalogue" @change=${(e: Event) => set({ actionId: val(e) })}></ve-combo>`
                    : html`<span class="note grow">only the children dispatch</span>`}
            </div>
            ${kind === 'menu' || asList(a.children).length ? html`<div class="sub">
                ${asList(a.children).map((c, j) => this.action(c, [...path, j]))}
                <div class="adds"><button @click=${() => this.set('headerActions', headerActionAdd(list(), path, { label: 'Item' }))}>+ Child</button></div>
            </div>` : ''}
        </div>`
    }

    /**
     * Every handler reads the CURRENT value when it fires (never one captured at render), and the
     * edit is applied here at once: two edits landing before the host re-renders (a field's change on
     * blur and the next control's in the same tick) both survive instead of the second undoing the first.
     */
    private set(key: string, value: unknown) {
        const next = { ...this.value }
        if (value === '' || value === undefined || (Array.isArray(value) && !value.length)) delete next[key]
        else next[key] = value
        this.value = next
        this.dispatchEvent(new CustomEvent('extras-changed', { detail: { key, value }, bubbles: true, composed: true }))
    }
}

const str = (v: unknown) => (v == null ? '' : String(v))
const val = (e: Event) => (e.target as HTMLInputElement).value.trim()
const valueOf = (e: Event) => (e.target as unknown as { value: unknown }).value

declare global {
    interface HTMLElementTagNameMap { 'app-header-extras': AppHeaderExtras }
}
