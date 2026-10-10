import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
    AppDoc, AppFields, AppMenuItem, parseApp, serializeApp,
    appActionIds, appActionSteps, setAppActionSteps, addAppFlowAction, removeAppAction,
    WIDGET_KINDS, widgetProp, addWidget, setWidgetProp, moveWidget, removeWidget,
} from '../model/appModel'
import { STEP_TYPES, stepParam, type FlowStep } from '../model/flowEditor'
import { enumValues } from '../model/schemaCatalog'
import type { ProjectIndex } from '../model/projectIndex'
import '../widgets/ve-combo'
import { formatAccessInline, parseAccessInline } from '../model/access'
import type { ComboOption } from '../widgets/comboModel'

/**
 * The app-shell editor: a form over the `app:` block of `routes.yaml` — title, chrome and the
 * navigation menu. Structured data, no canvas, no backend. Owns `app:` and preserves everything
 * else (`routes:`, widgets, unknown keys). Emits `app-save` {yaml}; the parent debounces the save.
 * `variant`/`layout` options come from the generated schema so they stay in sync with the backend.
 */
@customElement('app-editor')
export class AppEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-base, #fff); color: inherit; font: 13px var(--ve-font, system-ui); color: var(--ve-text, #111827); }
        .wrap { max-width: 720px; padding: 0.8rem 1.25rem 2rem; }
        h2 { margin: 0.6rem 0 0.2rem; font-size: 15px; }
        .section { font: 600 11px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .04em; color: var(--ve-secondary, #6b7280);
                   margin: 1.1rem 0 0.4rem; border-bottom: 1px solid var(--ve-border, #eceef1); padding-bottom: 0.3rem; }
        label { display: block; font-size: 11px; color: var(--ve-secondary, #6b7280); margin: 0.45rem 0 0.1rem; }
        input, select { width: 100%; padding: 0.4rem 0.5rem; font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade);
                border-radius: 6px; box-sizing: border-box; background: var(--ve-base, #fff); color: inherit; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 0.75rem; }
        .check { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.6rem; }
        .check input { width: auto; }
        .menu-item { border: 1px solid var(--ve-border, #e3e5e8); border-radius: 8px; padding: 0.5rem 0.6rem; margin: 0.4rem 0; background: #fbfbfc; }
        .menu-item .kind { font: 600 10px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .04em; color: var(--ve-tertiary, #8b93a1); }
        .menu-row { display: flex; gap: 0.4rem; align-items: center; }
        .menu-row input, .menu-row ve-combo { flex: 1; }
        .del { border: 1px solid #f2c2c8; color: var(--ve-error, #b00020); background: var(--ve-base, #fff); color: inherit; border-radius: 6px; height: 30px; min-width: 30px; cursor: pointer; }
        .sub { margin: 0.4rem 0 0 1rem; padding-left: 0.5rem; border-left: 2px solid var(--ve-border, #e9ebef); }
        .sep { height: 1px; background: var(--ve-input-border, #d7dade); flex: 1; }
        .raw { color: var(--ve-tertiary, #8b93a1); font-size: 12px; }
        .adds { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .adds button { padding: 0.35rem 0.7rem; font: 12px var(--ve-font, system-ui); background: var(--ve-base, #fff); color: inherit; border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px; cursor: pointer; }
        .adds button:hover { background: var(--ve-primary-10, #eef4ff); border-color: var(--ve-primary, #b7ccf7); }
        .accent { display: flex; gap: 0.35rem; align-items: center; }
        .accent input[type=color] { width: 2.4rem; padding: 0.1rem; height: 2rem; flex: none; }
        .note { color: var(--ve-tertiary, #9ca3af); font-size: 12px; margin-top: 0.4rem; }
        .checks { display: flex; flex-wrap: wrap; gap: 0 1.2rem; }
        .steps { display: flex; flex-direction: column; gap: 0.25rem; padding-left: 0.5rem; border-left: 2px solid var(--ve-border, #e9ebef); margin-top: 0.35rem; }
        .step select { width: 9rem; flex: none; }
        .mini { height: 30px; min-width: 30px; border: 1px solid var(--ve-input-border, #d7dade); background: var(--ve-base, #fff); color: inherit; border-radius: 6px; cursor: pointer; }
        .mini:disabled { opacity: .4; cursor: default; }
        .menu-row input.access { flex: 0 1 11rem; font-size: 12px; }
    `

    @property() yaml = ''
    @property({ attribute: false }) project?: ProjectIndex
    @state() private doc: AppDoc = { fields: {}, actions: [], menu: [], widgets: [], appRest: {} }
    @state() private newActionId = ''
    private lastEmitted?: string

    /** The routes this mount declares, for the menu-link and home-route pickers (empty without a project). */
    /** The mount's routes (the root, the shell itself, aside), each with the page it shows. */
    private get routeOptions(): ComboOption[] {
        return (this.project?.routes ?? []).filter((r) => r.route !== '')
            .map((r) => ({ value: r.route, hint: r.definition ?? r.viewModel }))
    }

    /** The shell's own flows — what a menu Action item, or a RunAction step, can run. */
    private get actionOptions(): ComboOption[] {
        return appActionIds(this.doc).map((id) => ({ value: id, hint: 'flow' }))
    }

    updated(changed: PropertyValues) {
        // Re-parse on a genuinely external change, but not on our own save echoed back (cursor jump).
        if (changed.has('yaml') && this.yaml !== this.lastEmitted) this.doc = parseApp(this.yaml)
    }

    render() {
        const f = this.doc.fields
        return html`
            <div class="wrap">
                <h2>App shell</h2>
                <div class="section">General</div>
                ${this.text('Title', 'title', f)}
                ${this.text('Subtitle', 'subtitle', f)}
                <div class="grid2">
                    <div>${this.select('Variant', 'variant', f, ['', ...enumValues('AppVariant')])}</div>
                    <div>${this.select('Layout', 'layout', f, ['', ...enumValues('AppLayout')])}</div>
                </div>
                <div class="grid2">
                    <div>${this.text('Logo', 'logo', f)}</div>
                    <div>${this.text('Favicon', 'favicon', f)}</div>
                </div>
                <div class="grid2">
                    <div>
                        <label>Accent colour</label>
                        <div class="accent">
                            <input type="color" .value=${/^#[0-9a-f]{6}$/i.test(f.accentColor ?? '') ? f.accentColor! : '#000000'}
                                title="The brand accent: a line under the menu band and the console name — not the primary colour"
                                @change=${(e: Event) => this.setField('accentColor', (e.target as HTMLInputElement).value)} />
                            <input .value=${f.accentColor ?? ''} placeholder="none (e.g. #D2232A)"
                                @change=${(e: Event) => this.setField('accentColor', (e.target as HTMLInputElement).value.trim())} />
                        </div>
                    </div>
                    <div>${this.select('Back link', 'backLink', f, ['', ...enumValues('BackLink')])}</div>
                </div>
                <label>Home route</label>
                <ve-combo .options=${this.routeOptions} placeholder="route" empty-text="No routes yet — add them in a routes file"
                    .value=${(f.homeRoute as string) ?? ''}
                    @change=${(e: Event) => this.setField('homeRoute', (e.target as HTMLInputElement).value)} ></ve-combo>
                <div class="check">
                    <input type="checkbox" .checked=${f.drawerClosed === true}
                        @change=${(e: Event) => this.setField('drawerClosed', (e.target as HTMLInputElement).checked)} />
                    Drawer closed
                </div>

                <div class="section">Header</div>
                <div class="checks">
                    ${this.check('Theme toggle', 'themeToggle', f, 'A moon/sun button that switches light/dark mode')}
                    ${this.check('Command center', 'commandCenter', f, 'A FAB opening a full-screen palette: menu, search, recents')}
                    ${this.check('Chromeless', 'chromeless', f, 'No navigation chrome (implies the command center)')}
                    ${this.check('Access keys', 'accessKeys', f, 'Holding Alt shows a key next to every button and tab')}
                </div>
                <div class="note">Unticked: the @App class (if any) decides.</div>

                <div class="section">Actions</div>
                <div class="note">Flows the shell declares — a bounded list of steps run in the browser, no backend. A menu “Action” item runs one.</div>
                ${appActionIds(this.doc).map((id) => this.renderFlow(id))}
                <div class="adds">
                    <input style="width:12rem" placeholder="new action id" .value=${this.newActionId}
                        @input=${(e: Event) => (this.newActionId = (e.target as HTMLInputElement).value)} />
                    <button ?disabled=${!this.newActionId.trim()} @click=${() => this.addFlow()}>+ Flow</button>
                </div>

                <div class="section">Menu</div>
                ${this.doc.menu.map((item, i) => this.menuItem(item, [i]))}
                <div class="adds">
                    <button @click=${() => this.addItem([], 'link')}>+ Link</button>
                    <button @click=${() => this.addItem([], 'action')}>+ Action</button>
                    <button @click=${() => this.addItem([], 'group')}>+ Group</button>
                    <button @click=${() => this.addItem([], 'separator')}>+ Separator</button>
                </div>

                <div class="section">Widgets</div>
                <div class="note">Components in the shell header (on MENU_ON_TOP, the top band).</div>
                ${this.doc.widgets.map((w, i) => this.renderWidget(w, i))}
                <div class="adds">
                    ${WIDGET_KINDS.map((k) => html`<button @click=${() => this.update_(addWidget(this.doc, k.type))}>+ ${k.type}</button>`)}
                </div>
            </div>
        `
    }

    // --- header switches ---

    private check(label: string, key: 'themeToggle' | 'commandCenter' | 'chromeless' | 'accessKeys', f: AppFields, title: string) {
        return html`<label class="check" title=${title}>
            <input type="checkbox" .checked=${f[key] === true}
                @change=${(e: Event) => this.setField(key, (e.target as HTMLInputElement).checked)} />
            ${label}
        </label>`
    }

    // --- actions: the shell's flows, with the page flow model ---

    private renderFlow(id: string): TemplateResult {
        const steps = appActionSteps(this.doc, id)
        return html`<div class="menu-item">
            <div class="menu-row"><span class="kind">Flow</span><strong>${id}</strong><span class="sep"></span>
                <button class="del" title="Remove action" @click=${() => this.update_(removeAppAction(this.doc, id))}>✕</button></div>
            <div class="steps">
                ${steps.map((s, i) => this.renderStep(id, steps, s, i))}
                <div class="adds"><button @click=${() => this.setSteps(id, [...steps, { type: 'Navigate', extra: {} }])}>+ Step</button></div>
            </div>
        </div>`
    }

    private renderStep(id: string, steps: FlowStep[], s: FlowStep, i: number): TemplateResult {
        const p = stepParam(s.type)
        return html`<div class="menu-row step">
            <select @change=${(e: Event) => this.setStep(id, steps, i, 'type', (e.target as HTMLSelectElement).value)}>
                ${STEP_TYPES.map((t) => html`<option value=${t} ?selected=${t === s.type}>${t}</option>`)}
            </select>
            ${p ? (p.key === 'event'
                    ? html`<input placeholder=${p.label} .value=${(s[p.key] as string) ?? ''}
                        @change=${(e: Event) => this.setStep(id, steps, i, p.key, (e.target as HTMLInputElement).value)} />`
                    : html`<ve-combo placeholder=${p.label} .value=${(s[p.key] as string) ?? ''}
                        .options=${p.key === 'route' ? this.routeOptions : this.actionOptions.filter((o) => o.value !== id)}
                        @change=${(e: Event) => this.setStep(id, steps, i, p.key, (e.target as HTMLInputElement).value)}></ve-combo>`)
                : html`<span class="sep"></span>`}
            <button class="mini" @click=${() => this.moveStep(id, steps, i, -1)} ?disabled=${i === 0}>↑</button>
            <button class="mini" @click=${() => this.moveStep(id, steps, i, 1)} ?disabled=${i === steps.length - 1}>↓</button>
            <button class="del" @click=${() => this.setSteps(id, steps.filter((_, j) => j !== i))}>✕</button>
        </div>`
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
        this.update_(setAppActionSteps(this.doc, id, steps))
    }

    private addFlow() {
        const id = this.newActionId.trim()
        if (!id) return
        this.newActionId = ''
        this.update_(addAppFlowAction(this.doc, id))
    }

    // --- widgets: components in the header, kept raw; the common ones edit their text inline ---

    private renderWidget(w: unknown, i: number): TemplateResult {
        const prop = widgetProp(w)
        const type = String((w as { type?: unknown } | null)?.type ?? '?')
        return html`<div class="menu-item"><div class="menu-row">
            <span class="kind" style="min-width:4rem">${type}</span>
            ${prop ? html`<input .value=${String((w as Record<string, unknown>)[prop] ?? '')} placeholder=${prop}
                        @change=${(e: Event) => this.update_(setWidgetProp(this.doc, i, (e.target as HTMLInputElement).value))} />`
                : html`<span class="raw">preserved — edit in YAML</span><span class="sep"></span>`}
            <button class="mini" title="Move up" @click=${() => this.update_(moveWidget(this.doc, i, -1))} ?disabled=${i === 0}>↑</button>
            <button class="mini" title="Move down" @click=${() => this.update_(moveWidget(this.doc, i, 1))} ?disabled=${i === this.doc.widgets.length - 1}>↓</button>
            <button class="del" title="Remove" @click=${() => this.update_(removeWidget(this.doc, i))}>✕</button>
        </div></div>`
    }

    private update_(doc: AppDoc) {
        this.doc = doc
        this.commit()
    }

    // --- fields ---

    private text(label: string, key: keyof AppFields, f: AppFields) {
        return html`
            <label>${label}</label>
            <input .value=${(f[key] as string) ?? ''} @change=${(e: Event) => this.setField(key, (e.target as HTMLInputElement).value)} />`
    }

    private select(label: string, key: keyof AppFields, f: AppFields, options: string[]) {
        return html`
            <label>${label}</label>
            <select @change=${(e: Event) => this.setField(key, (e.target as HTMLSelectElement).value)}>
                ${options.map((o) => html`<option value=${o} ?selected=${(f[key] ?? '') === o}>${o || '—'}</option>`)}
            </select>`
    }

    private setField(key: keyof AppFields, value: string | boolean) {
        const fields = { ...this.doc.fields }
        if (value === '' || value === false) delete (fields as any)[key]
        else (fields as any)[key] = value
        this.doc = { ...this.doc, fields }
        this.commit()
    }

    // --- menu (path = [i] at top level, [i, j] inside a group) ---

    private menuItem(item: AppMenuItem, path: number[]): TemplateResult {
        if (item.kind === 'separator') {
            return html`<div class="menu-item"><div class="menu-row"><span class="kind">Separator</span><span class="sep"></span>${this.delBtn(path)}</div></div>`
        }
        if (item.kind === 'raw') {
            return html`<div class="menu-item"><div class="menu-row"><span class="kind">Custom</span><span class="raw">raw menu item — edit in YAML</span><span class="sep"></span>${this.delBtn(path)}</div></div>`
        }
        if (item.kind === 'action') {
            return html`<div class="menu-item">
                <span class="kind">Action</span>
                <div class="menu-row">
                    <input placeholder="Label" .value=${item.label ?? ''} @change=${(e: Event) => this.setItem(path, 'label', (e.target as HTMLInputElement).value)} />
                    <ve-combo placeholder="actionId" title="One of the shell's flows (Actions above), or a server @Action id"
                        .options=${this.actionOptions} empty-text="No flows yet — add one in Actions, or type a server @Action id"
                        .value=${item.actionId ?? ''} @change=${(e: Event) => this.setItem(path, 'actionId', (e.target as HTMLInputElement).value)}></ve-combo>
                    ${this.accessInput(item, path)}
                    ${this.delBtn(path)}
                </div>
            </div>`
        }
        if (item.kind === 'link') {
            return html`<div class="menu-item">
                <span class="kind">Link</span>
                <div class="menu-row">
                    <input placeholder="Label" .value=${item.label ?? ''} @change=${(e: Event) => this.setItem(path, 'label', (e.target as HTMLInputElement).value)} />
                    <ve-combo placeholder="route" .options=${this.routeOptions} empty-text="No routes yet — add them in a routes file"
                        .value=${item.route ?? ''} @change=${(e: Event) => this.setItem(path, 'route', (e.target as HTMLInputElement).value)}></ve-combo>
                    <input placeholder="icon" .value=${item.icon ?? ''} @change=${(e: Event) => this.setItem(path, 'icon', (e.target as HTMLInputElement).value)} />
                    ${this.accessInput(item, path)}
                    ${this.delBtn(path)}
                </div>
            </div>`
        }
        // group
        return html`<div class="menu-item">
            <span class="kind">Group</span>
            <div class="menu-row">
                <input placeholder="Label" .value=${item.label ?? ''} @change=${(e: Event) => this.setItem(path, 'label', (e.target as HTMLInputElement).value)} />
                ${this.accessInput(item, path)}
                ${this.delBtn(path)}
            </div>
            <div class="sub">
                ${item.submenu.map((child, j) => this.menuItem(child, [...path, j]))}
                <div class="adds">
                    <button @click=${() => this.addItem(path, 'link')}>+ Link</button>
                    <button @click=${() => this.addItem(path, 'action')}>+ Action</button>
                    <button @click=${() => this.addItem(path, 'separator')}>+ Separator</button>
                </div>
            </div>
        </div>`
    }

    /**
     * Who sees this menu item (`access:`), one line: `admin, hr` (roles) or `roles=…; scopes=…`.
     * The server drops it for anybody else; a link with none inherits its route's `access:`.
     */
    private accessInput(item: AppMenuItem, path: number[]) {
        const extra = (item as { extra?: Record<string, unknown> }).extra ?? {}
        return html`<input class="access" placeholder="🔒 visible to (roles)" aria-label="Access"
            title="access: — who sees this item (roles, or roles=…; groups=…; scopes=…; permissions=…). Checked on the server; a link with none inherits its route's."
            .value=${formatAccessInline(extra.access)}
            @change=${(e: Event) => this.setItemAccess(path, (e.target as HTMLInputElement).value)} />`
    }

    private setItemAccess(path: number[], text: string) {
        const menu = structuredClone(this.doc.menu)
        const item = this.at(menu, path) as { extra?: Record<string, unknown> } | undefined
        if (item) {
            const extra = { ...(item.extra ?? {}) }
            const access = parseAccessInline(text)
            if (access) extra.access = access
            else delete extra.access
            item.extra = extra
        }
        this.doc = { ...this.doc, menu }
        this.commit()
    }

    private delBtn(path: number[]) {
        return html`<button class="del" title="Remove" @click=${() => this.removeItem(path)}>✕</button>`
    }

    private setItem(path: number[], key: 'label' | 'route' | 'icon' | 'actionId', value: string) {
        const menu = structuredClone(this.doc.menu)
        const item = this.at(menu, path)
        if (item) {
            if (value) (item as any)[key] = value
            else delete (item as any)[key]
        }
        this.doc = { ...this.doc, menu }
        this.commit()
    }

    private addItem(parentPath: number[], kind: 'link' | 'action' | 'group' | 'separator') {
        const fresh: AppMenuItem =
            kind === 'link' ? { kind: 'link', label: 'Label', route: 'route', extra: {} }
            : kind === 'action' ? { kind: 'action', label: 'Action', actionId: 'actionId', extra: {} }
            : kind === 'group' ? { kind: 'group', label: 'Group', submenu: [], extra: {} }
            : { kind: 'separator' }
        const menu = structuredClone(this.doc.menu)
        if (parentPath.length === 0) menu.push(fresh)
        else {
            const parent = this.at(menu, parentPath)
            if (parent && parent.kind === 'group') parent.submenu.push(fresh)
        }
        this.doc = { ...this.doc, menu }
        this.commit()
    }

    private removeItem(path: number[]) {
        const menu = structuredClone(this.doc.menu)
        const parentPath = path.slice(0, -1)
        const idx = path[path.length - 1]
        const list = parentPath.length === 0 ? menu : (this.at(menu, parentPath) as any)?.submenu
        if (Array.isArray(list)) list.splice(idx, 1)
        this.doc = { ...this.doc, menu }
        this.commit()
    }

    private at(menu: AppMenuItem[], path: number[]): AppMenuItem | undefined {
        let list: AppMenuItem[] | undefined = menu
        let item: AppMenuItem | undefined
        for (const i of path) {
            if (!list) return undefined
            item = list[i]
            list = item && item.kind === 'group' ? item.submenu : undefined
        }
        return item
    }

    private commit() {
        const yaml = serializeApp(this.doc)
        this.lastEmitted = yaml
        this.dispatchEvent(new CustomEvent('app-save', { detail: { yaml }, bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'app-editor': AppEditor }
}
