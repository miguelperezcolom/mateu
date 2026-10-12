import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { FocusTrap, trapFocus } from '@infra/a11y/focusTrap.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { qrDataUri } from '@infra/ui/qr/qrEncoder.ts'
import { currentRoute, mobileAddUrl } from '@infra/ui/qr/mobileLink.ts'

/**
 * "Open on mobile" (`@App(mobileQr = true)`, design/mobile-app-hub.md): a modal with the QR a phone
 * scans to add this UI to the Mateu mobile app, the link as copyable text and a one-line hint. On a
 * phone (narrow or touch) there is nothing to scan, so it offers the link itself — "Open in the
 * Mateu app" — instead.
 *
 * Loaded on demand (a dynamic import from the header button), so neither this element nor the QR
 * encoder weighs on the eager bundle. Design-system neutral: Lumo tokens with fallbacks. The QR is
 * always dark on white — it has to scan in a dark theme too.
 */
@customElement('mateu-mobile-qr-dialog')
export class MateuMobileQrDialog extends LitElement {

    /** The app's title, for the heading and the alt text. */
    @property() appTitle = ''

    /** The `https://mateu.io/add?...` link the QR encodes. */
    @property() url = ''

    /** Forces the phone presentation (tests); otherwise detected from the viewport and pointer. */
    @property({ type: Boolean }) phone?: boolean

    @state() private copied = false

    private focusTrap: FocusTrap | undefined

    static styles = css`
        :host { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; }
        .backdrop { position: absolute; inset: 0; background: var(--lumo-shade-50pct, rgba(0, 0, 0, .5)); }
        .panel {
            position: relative; box-sizing: border-box; width: min(24rem, calc(100vw - 2 * var(--lumo-space-m, 1rem)));
            max-height: calc(100vh - 2 * var(--lumo-space-m, 1rem)); overflow: auto;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: var(--lumo-border-radius-l, 12px); box-shadow: var(--lumo-box-shadow-xl, 0 8px 32px rgba(0, 0, 0, .3));
            padding: var(--lumo-space-l, 1.5rem); display: flex; flex-direction: column; gap: var(--lumo-space-m, 1rem);
            font-family: var(--lumo-font-family, system-ui, sans-serif);
        }
        h2 { margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); line-height: var(--lumo-line-height-xs, 1.25); padding-right: var(--lumo-space-xl, 2.5rem); }
        .close {
            position: absolute; top: var(--lumo-space-s, .5rem); right: var(--lumo-space-s, .5rem);
            width: var(--lumo-size-m, 2.25rem); height: var(--lumo-size-m, 2.25rem); border: none; background: transparent;
            color: var(--lumo-secondary-text-color, #555); font: inherit; font-size: var(--lumo-font-size-l, 1.125rem);
            border-radius: var(--lumo-border-radius-m, 8px); cursor: pointer;
        }
        .qr { align-self: center; width: min(16rem, 100%); aspect-ratio: 1; image-rendering: pixelated; border-radius: var(--lumo-border-radius-m, 8px); }
        p { margin: 0; color: var(--lumo-secondary-text-color, #555); font-size: var(--lumo-font-size-s, .875rem); line-height: var(--lumo-line-height-s, 1.375); }
        label { font-size: var(--lumo-font-size-xs, .8125rem); color: var(--lumo-secondary-text-color, #555); }
        .link-row { display: flex; gap: var(--lumo-space-s, .5rem); align-items: stretch; }
        input {
            flex: 1; min-width: 0; font: inherit; font-size: var(--lumo-font-size-s, .875rem); padding: var(--lumo-space-xs, .25rem) var(--lumo-space-s, .5rem);
            border: 1px solid var(--lumo-contrast-30pct, #bbb); border-radius: var(--lumo-border-radius-m, 8px);
            background: var(--lumo-contrast-5pct, #f4f4f4); color: inherit;
        }
        button.copy, a.open {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600; cursor: pointer; text-decoration: none; text-align: center;
            padding: var(--lumo-space-xs, .25rem) var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-m, 8px);
            border: none; background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff);
        }
        a.open { padding: var(--lumo-space-s, .5rem) var(--lumo-space-m, 1rem); font-size: var(--lumo-font-size-m, 1rem); }
        button:focus-visible, a:focus-visible, input:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #1676f3); outline-offset: 2px;
        }
    `

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('keydown', this.onKeydown)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('keydown', this.onKeydown)
        this.focusTrap?.release()
        this.focusTrap = undefined
    }

    firstUpdated() {
        const panel = this.renderRoot.querySelector('[role="dialog"]') as HTMLElement | null
        if (panel) this.focusTrap = trapFocus(panel)
    }

    private onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopPropagation()
            this.close()
        }
    }

    close() {
        this.focusTrap?.release()
        this.focusTrap = undefined
        this.remove()
    }

    private get onPhone(): boolean {
        if (this.phone !== undefined) return this.phone
        return typeof window.matchMedia === 'function'
            && (window.matchMedia('(max-width: 600px)').matches || window.matchMedia('(pointer: coarse)').matches)
    }

    private async copy() {
        try {
            await navigator.clipboard.writeText(this.url)
        } catch {
            const input = this.renderRoot.querySelector('input') as HTMLInputElement | null
            input?.select()
            document.execCommand?.('copy')
        }
        this.copied = true
        announce(chromeText('linkCopied'))
        setTimeout(() => { this.copied = false }, 2000)
    }

    render() {
        const app = this.appTitle || document.title || 'Mateu'
        const phone = this.onPhone
        return html`
            <div class="backdrop" @click="${() => this.close()}"></div>
            <div class="panel" role="dialog" aria-modal="true" aria-labelledby="mobile-qr-title"
                 aria-describedby="mobile-qr-hint">
                <h2 id="mobile-qr-title">${chromeTextf(phone ? 'mobileQrPhoneTitle' : 'mobileQrTitle', { app })}</h2>
                <button class="close" @click="${() => this.close()}" aria-label="${chromeText('close')}"
                        title="${chromeText('close')}">✕</button>
                ${phone ? html`
                    <p id="mobile-qr-hint">${chromeText('mobileQrOnPhone')}</p>
                    <a class="open" href="${this.url}">${chromeText('openInMateuApp')}</a>` : html`
                    <img class="qr" src="${qrDataUri(this.url)}" alt="${chromeTextf('mobileQrAlt', { app })}">
                    <p id="mobile-qr-hint">${chromeText('mobileQrHint')}</p>
                    <label for="mobile-qr-url">${chromeText('mobileQrUrl')}</label>
                    <div class="link-row">
                        <input id="mobile-qr-url" readonly .value="${this.url}" @focus="${(e: Event) => (e.target as HTMLInputElement).select()}">
                        <button class="copy" @click="${() => this.copy()}">${this.copied ? chromeText('linkCopied') : chromeText('copyLink')}</button>
                    </div>`}
            </div>`
    }
}

/**
 * Opens the dialog for the app at `baseUrl`, aimed at the screen the browser is on. One at a time:
 * a second open replaces the first.
 */
export const openMobileQrDialog = (options: { appTitle?: string, baseUrl?: string }): MateuMobileQrDialog => {
    document.querySelectorAll('mateu-mobile-qr-dialog').forEach((d) => (d as MateuMobileQrDialog).close())
    const dialog = document.createElement('mateu-mobile-qr-dialog') as MateuMobileQrDialog
    dialog.appTitle = options.appTitle ?? ''
    dialog.url = mobileAddUrl(window.location.origin, options.baseUrl,
        currentRoute(window.location.pathname, window.location.search, options.baseUrl))
    document.body.appendChild(dialog)
    return dialog
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-mobile-qr-dialog': MateuMobileQrDialog
    }
}
