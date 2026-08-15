import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { AppDoc, AppFields, AppMenuItem, parseApp, serializeApp } from '../model/appModel'
import { enumValues } from '../model/schemaCatalog'

/**
 * The app-shell editor: a form over the `app:` block of `routes.yaml` — title, chrome and the
 * navigation menu. Structured data, no canvas, no backend. Owns `app:` and preserves everything
 * else (`routes:`, widgets, unknown keys). Emits `app-save` {yaml}; the parent debounces the save.
 * `variant`/`layout` options come from the generated schema so they stay in sync with the backend.
 */
@customElement('app-editor')
export class AppEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: #fff; font: 13px system-ui; color: #111827; }
        .wrap { max-width: 720px; padding: 0.8rem 1.25rem 2rem; }
        h2 { margin: 0.6rem 0 0.2rem; font-size: 15px; }
        .section { font: 600 11px system-ui; text-transform: uppercase; letter-spacing: .04em; color: #6b7280;
                   margin: 1.1rem 0 0.4rem; border-bottom: 1px solid #eceef1; padding-bottom: 0.3rem; }
        label { display: block; font-size: 11px; color: #6b7280; margin: 0.45rem 0 0.1rem; }
        input, select { width: 100%; padding: 0.4rem 0.5rem; font: 13px system-ui; border: 1px solid #d7dade;
                border-radius: 6px; box-sizing: border-box; background: #fff; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 0.75rem; }
        .check { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.6rem; }
        .check input { width: auto; }
        .menu-item { border: 1px solid #e3e5e8; border-radius: 8px; padding: 0.5rem 0.6rem; margin: 0.4rem 0; background: #fbfbfc; }
        .menu-item .kind { font: 600 10px system-ui; text-transform: uppercase; letter-spacing: .04em; color: #8b93a1; }
        .menu-row { display: flex; gap: 0.4rem; align-items: center; }
        .menu-row input { flex: 1; }
        .del { border: 1px solid #f2c2c8; color: #b00020; background: #fff; border-radius: 6px; height: 30px; min-width: 30px; cursor: pointer; }
        .sub { margin: 0.4rem 0 0 1rem; padding-left: 0.5rem; border-left: 2px solid #e9ebef; }
        .sep { height: 1px; background: #d7dade; flex: 1; }
        .raw { color: #8b93a1; font-size: 12px; }
        .adds { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .adds button { padding: 0.35rem 0.7rem; font: 12px system-ui; background: #fff; border: 1px solid #d7dade; border-radius: 6px; cursor: pointer; }
        .adds button:hover { background: #eef4ff; border-color: #b7ccf7; }
        .note { color: #9ca3af; font-size: 12px; margin-top: 0.4rem; }
    `

    @property() yaml = ''
    @state() private doc: AppDoc = { fields: {}, menu: [], widgets: [], appRest: {} }
    private lastEmitted?: string

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
                ${this.text('Home route', 'homeRoute', f)}
                <div class="check">
                    <input type="checkbox" .checked=${f.drawerClosed === true}
                        @change=${(e: Event) => this.setField('drawerClosed', (e.target as HTMLInputElement).checked)} />
                    Drawer closed
                </div>

                <div class="section">Menu</div>
                ${this.doc.menu.map((item, i) => this.menuItem(item, [i]))}
                <div class="adds">
                    <button @click=${() => this.addItem([], 'link')}>+ Link</button>
                    <button @click=${() => this.addItem([], 'group')}>+ Group</button>
                    <button @click=${() => this.addItem([], 'separator')}>+ Separator</button>
                </div>

                ${this.doc.widgets.length ? html`
                    <div class="section">Widgets</div>
                    <div class="note">${this.doc.widgets.length} widget${this.doc.widgets.length === 1 ? '' : 's'} — preserved; edit in YAML for now.</div>` : ''}
            </div>
        `
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
        if (item.kind === 'link') {
            return html`<div class="menu-item">
                <span class="kind">Link</span>
                <div class="menu-row">
                    <input placeholder="Label" .value=${item.label ?? ''} @change=${(e: Event) => this.setItem(path, 'label', (e.target as HTMLInputElement).value)} />
                    <input placeholder="route" .value=${item.route ?? ''} @change=${(e: Event) => this.setItem(path, 'route', (e.target as HTMLInputElement).value)} />
                    <input placeholder="icon" .value=${item.icon ?? ''} @change=${(e: Event) => this.setItem(path, 'icon', (e.target as HTMLInputElement).value)} />
                    ${this.delBtn(path)}
                </div>
            </div>`
        }
        // group
        return html`<div class="menu-item">
            <span class="kind">Group</span>
            <div class="menu-row">
                <input placeholder="Label" .value=${item.label ?? ''} @change=${(e: Event) => this.setItem(path, 'label', (e.target as HTMLInputElement).value)} />
                ${this.delBtn(path)}
            </div>
            <div class="sub">
                ${item.submenu.map((child, j) => this.menuItem(child, [...path, j]))}
                <div class="adds">
                    <button @click=${() => this.addItem(path, 'link')}>+ Link</button>
                    <button @click=${() => this.addItem(path, 'separator')}>+ Separator</button>
                </div>
            </div>
        </div>`
    }

    private delBtn(path: number[]) {
        return html`<button class="del" title="Remove" @click=${() => this.removeItem(path)}>✕</button>`
    }

    private setItem(path: number[], key: 'label' | 'route' | 'icon', value: string) {
        const menu = structuredClone(this.doc.menu)
        const item = this.at(menu, path)
        if (item) {
            if (value) (item as any)[key] = value
            else delete (item as any)[key]
        }
        this.doc = { ...this.doc, menu }
        this.commit()
    }

    private addItem(parentPath: number[], kind: 'link' | 'group' | 'separator') {
        const fresh: AppMenuItem =
            kind === 'link' ? { kind: 'link', label: 'Label', route: 'route', extra: {} }
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
