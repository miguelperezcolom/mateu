/**
 * <mateu-markdown> — design-system-neutral markdown element (renderer parity phase 2).
 *
 * Renders markdown with the exact same pipeline vaadin-markdown uses (marked → DOMPurify,
 * allowing custom elements), into the component's LIGHT DOM so the host app's typography
 * applies unchanged. Under the Vaadin renderer the output is therefore pixel-equivalent to
 * vaadin-markdown; under any other renderer it inherits that design system's typography.
 *
 * A bare custom element (no Lit) so it renders identically whether the host tree uses shadow
 * or light DOM, and stays importable from node-based unit tests (same pattern as
 * <mateu-unsupported>). marked + dompurify are lazy-loaded to stay out of the initial bundle.
 */

// HTMLElement does not exist under plain node (vitest); use a no-op base there so this module
// stays importable from unit tests. The element is only defined when customElements exists.
const Base = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) as typeof HTMLElement

export class MateuMarkdown extends Base {

    static get observedAttributes() { return ['content'] }

    #content: string | undefined
    #renderSeq = 0

    get content(): string | undefined { return this.#content }

    set content(value: string | undefined) {
        this.#content = value
        void this.#render()
    }

    attributeChangedCallback(_name: string, _old: string | null, value: string | null) {
        this.content = value ?? undefined
    }

    connectedCallback() {
        this.style.display = 'block'
        void this.#render()
    }

    async #render() {
        if (!this.isConnected) {
            return
        }
        const content = this.#content ?? ''
        const seq = ++this.#renderSeq
        const [{ marked }, { default: DOMPurify }] = await Promise.all([
            import('marked'),
            import('dompurify'),
        ])
        // the content may have changed (or the element been re-rendered) while loading
        if (seq !== this.#renderSeq) {
            return
        }
        // html + svg profiles: agents answer with markdown that may embed images
        // (data: URIs included) and inline <svg> renders — e.g. a model diagram —
        // which must survive sanitization; custom elements keep passing through.
        this.innerHTML = DOMPurify.sanitize(await marked.parse(content), {
            USE_PROFILES: { html: true, svg: true, svgFilters: true },
            CUSTOM_ELEMENT_HANDLING: {
                tagNameCheck: (_tagName: string) => true,
            },
        })
    }
}

if (typeof customElements !== 'undefined' && !customElements.get('mateu-markdown')) {
    customElements.define('mateu-markdown', MateuMarkdown)
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-markdown': MateuMarkdown
    }
}
