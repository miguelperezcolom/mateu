import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { AppShortcut } from '@mateu/shared/apiClients/dtos/componentmetadata/AppShellExtras.ts'
import { FocusTrap, trapFocus } from '@infra/a11y/focusTrap.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { keyLabel, ListedShortcut, screenShortcuts } from '@infra/ui/appShortcuts.ts'

/**
 * The "Keyboard shortcuts" overlay (the `?` key): the app-wide shortcuts (`@AppShortcut`, with their
 * quick-launch codes), the shortcuts of the screen on show (its `@Action(shortcut)` / `@Tab(shortcut)`
 * — read from the DOM when it opens, so it is always the current screen's), and the two keys of the
 * shell itself. Picking an app shortcut runs it. A modal dialog: focus trapped, Escape closes it and
 * gives the focus back.
 */
@customElement('mateu-shortcuts-help')
export class MateuShortcutsHelp extends LitElement {

    @property({ attribute: false }) shortcuts: AppShortcut[] = []
    /** Runs an app shortcut (navigation or app-level action) — set by the mount. */
    @property({ attribute: false }) run: ((s: AppShortcut) => void) | undefined
    @state() open = false
    @state() screen: ListedShortcut[] = []
    private trap: FocusTrap | undefined

    show() {
        this.screen = screenShortcuts(document)
        this.open = true
    }

    close() {
        this.open = false
        this.trap?.release()
        this.trap = undefined
    }

    private onKeydown = (e: KeyboardEvent) => {
        if (this.open && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close() }
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('keydown', this.onKeydown, true)
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this.onKeydown, true)
        this.trap?.release()
        super.disconnectedCallback()
    }

    updated() {
        const dialog = this.renderRoot.querySelector('[role="dialog"]') as HTMLElement | null
        if (this.open && dialog && !this.trap) this.trap = trapFocus(dialog)
    }

    private pick(s: AppShortcut) {
        this.close()
        this.run?.(s)
    }

    render() {
        if (!this.open) return nothing
        const appRows = this.shortcuts.filter((s) => s.key || s.code)
        const appKeys = new Set(appRows.map((s) => (s.key ?? '').toLowerCase()))
        // a screen shortcut on the same key as an app one wins — say so by listing it on the screen side only
        return html`
            <div class="backdrop" @click="${() => this.close()}"></div>
            <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
                <div class="head">
                    <h2 id="shortcuts-title">${chromeText('keyboardShortcuts')}</h2>
                    <button class="close" type="button" aria-label="${chromeText('close')}" @click="${() => this.close()}">✕</button>
                </div>
                ${appRows.length ? html`
                    <h3>${chromeText('shortcutsApp')}</h3>
                    <ul>
                        ${appRows.map((s) => html`
                            <li>
                                <button class="row" type="button" @click="${() => this.pick(s)}">
                                    <span class="label">${s.label}</span>
                                    ${s.code ? html`<span class="code" title="${chromeText('quickLaunchCode')}">${s.code}</span>` : nothing}
                                    ${s.key ? html`<kbd>${keyLabel(s.key)}</kbd>` : nothing}
                                </button>
                            </li>`)}
                    </ul>` : nothing}
                ${this.screen.length ? html`
                    <h3>${chromeText('shortcutsScreen')}</h3>
                    <ul>
                        ${this.screen.map((s) => html`
                            <li class="static ${appKeys.has(s.key) ? 'overrides' : ''}">
                                <span class="label">${s.label}</span><kbd>${keyLabel(s.key)}</kbd>
                            </li>`)}
                    </ul>` : nothing}
                <ul class="shell">
                    <li class="static"><span class="label">${chromeText('shortcutsHelpKey')}</span><kbd>?</kbd></li>
                    <li class="static"><span class="label">${chromeText('shortcutsPalette')}</span><kbd>Ctrl+K</kbd></li>
                </ul>
            </div>`
    }

    static styles = css`
        .backdrop { position: fixed; inset: 0; z-index: 1500; background: var(--lumo-shade-50pct, rgba(0, 0, 0, 0.4)); }
        .dialog {
            position: fixed; z-index: 1501; top: 10vh; left: 50%; transform: translateX(-50%);
            width: min(34rem, calc(100vw - 2rem)); max-height: 80vh; overflow: auto; box-sizing: border-box;
            padding: var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 10px);
            background: var(--lumo-base-color, Canvas); color: var(--lumo-body-text-color, CanvasText);
            box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0, 0, 0, 0.3));
        }
        .head { display: flex; justify-content: space-between; align-items: center; }
        h2 { margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); }
        h3 { margin: var(--lumo-space-m, 1rem) 0 var(--lumo-space-xs, 0.25rem); font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-secondary-text-color, inherit); text-transform: uppercase; letter-spacing: 0.04em; }
        ul { list-style: none; margin: 0; padding: 0; }
        ul.shell { margin-top: var(--lumo-space-m, 1rem); border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
            padding-top: var(--lumo-space-s, 0.5rem); }
        li.static, .row { display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);
            padding: var(--lumo-space-xs, 0.25rem) 0; width: 100%; }
        .row { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; text-align: start;
            border-radius: var(--lumo-border-radius-s, 4px); padding-inline: var(--lumo-space-xs, 0.25rem); }
        .row:hover { background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.05)); }
        .row:focus-visible, .close:focus-visible { outline: 2px solid var(--lumo-primary-color, Highlight); outline-offset: 2px; }
        .label { flex: 1; }
        .code { font-family: var(--lumo-font-family, monospace); font-size: var(--lumo-font-size-xs, 0.8125rem);
            color: var(--lumo-primary-text-color, inherit); }
        kbd { font-family: inherit; font-size: var(--lumo-font-size-xs, 0.8125rem); padding: 0 var(--lumo-space-xs, 0.25rem);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3)); border-radius: var(--lumo-border-radius-s, 4px);
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.05)); }
        .close { font: inherit; background: none; border: 0; color: inherit; cursor: pointer; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-shortcuts-help': MateuShortcutsHelp
    }
}
