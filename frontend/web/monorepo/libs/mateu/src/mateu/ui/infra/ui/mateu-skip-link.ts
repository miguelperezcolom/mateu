import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

/**
 * "Skip to content" — the first tabbable thing in the document.
 *
 * Every screen in an app shell starts with the same navigation. Without a way past it, a keyboard
 * user pays for that menu on every single page: Tab, Tab, Tab, through twenty links they have
 * already read, before reaching the form they came for. WCAG 2.4.1 asks for a bypass, and this is
 * the conventional one.
 *
 * It is visually hidden until focused, so it costs sighted mouse users nothing and appears — as a
 * real, visible button — the moment someone Tabs into the page.
 *
 * Activating it cannot use a plain `href="#main"`: the content lives inside nested shadow roots
 * where a document-level fragment link cannot reach. So it finds the content region by walking
 * into open shadow roots, makes it programmatically focusable and focuses it, which is what the
 * anchor would have done anyway.
 */
@customElement('mateu-skip-link')
export class MateuSkipLink extends LitElement {

    /** Content regions, best first. */
    private static TARGETS = ['.app-content', 'mateu-page', 'mateu-ux', 'mateu-component']

    private findContent(): HTMLElement | null {
        const seen = new Set<ParentNode>()
        const search = (root: ParentNode): HTMLElement | null => {
            if (seen.has(root)) return null
            seen.add(root)
            for (const selector of MateuSkipLink.TARGETS) {
                const hit = root.querySelector?.(selector) as HTMLElement | null
                // Skip our own host and anything with no box (a detached or empty region).
                if (hit && hit !== (this as unknown as HTMLElement)) return hit
            }
            for (const el of Array.from(root.querySelectorAll?.('*') ?? [])) {
                if ((el as HTMLElement).shadowRoot) {
                    const hit = search((el as HTMLElement).shadowRoot!)
                    if (hit) return hit
                }
            }
            return null
        }
        return search(document)
    }

    private skip = () => {
        const content = this.findContent()
        if (!content) return
        // A container is not focusable by default; -1 makes it focusable programmatically without
        // adding a tab stop of its own.
        if (!content.hasAttribute('tabindex')) content.setAttribute('tabindex', '-1')
        content.focus()
        content.scrollIntoView({ block: 'start' })
    }

    render() {
        return html`<button class="skip" @click="${this.skip}">Skip to content</button>`
    }

    static styles = css`
        :host {
            position: fixed;
            inset-block-start: 0;
            inset-inline-start: 0;
            z-index: 4000;
        }
        /*
         * Hidden by being moved off-screen rather than by display:none — a display:none element is
         * not focusable at all, which would make the link unreachable and therefore pointless.
         */
        .skip {
            position: absolute;
            transform: translateY(-200%);
            margin: .5rem;
            padding: .5rem 1rem;
            font: inherit;
            font-weight: 600;
            color: var(--lumo-primary-contrast-color, #fff);
            background: var(--lumo-primary-color, #3b5bdb);
            border: 2px solid var(--lumo-primary-color, #3b5bdb);
            border-radius: var(--lumo-border-radius-m, 6px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0, 0, 0, .2));
            cursor: pointer;
            white-space: nowrap;
            transition: transform .15s ease;
        }
        .skip:focus-visible,
        .skip:focus {
            transform: none;
            outline: 2px solid var(--lumo-body-text-color, #161513);
            outline-offset: 2px;
        }
    `
}

let mounted: MateuSkipLink | null = null

/**
 * Mounts the one skip link for the document, as the FIRST child of body so it is the first thing
 * Tab reaches. Idempotent; called from the composition root.
 */
export function mountSkipLink(): void {
    if (typeof document === 'undefined') return
    if (mounted && mounted.isConnected) return
    if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => mountSkipLink(), { once: true })
        return
    }
    mounted = document.createElement('mateu-skip-link') as MateuSkipLink
    document.body.insertBefore(mounted, document.body.firstChild)
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-skip-link': MateuSkipLink
    }
}
