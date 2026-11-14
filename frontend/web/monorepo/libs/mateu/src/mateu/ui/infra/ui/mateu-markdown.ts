/**
 * <mateu-markdown> — design-system-neutral markdown element (renderer parity phase 2).
 *
 * Renders markdown with the same pipeline vaadin-markdown uses (marked → DOMPurify, with
 * Mateu's data policy — see sanitizePolicy.ts), into the component's LIGHT DOM so the host app's typography
 * applies unchanged. Under the Vaadin renderer the output is therefore pixel-equivalent to
 * vaadin-markdown; under any other renderer it inherits that design system's typography.
 *
 * A bare custom element (no Lit) so it renders identically whether the host tree uses shadow
 * or light DOM, and stays importable from node-based unit tests (same pattern as
 * <mateu-unsupported>). marked + dompurify are lazy-loaded to stay out of the initial bundle.
 */
import { dataHtmlPolicy, installDataHtmlHooks } from './sanitizePolicy'

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
        // which must survive sanitization; custom elements only from the allow-list (a
        // `<mateu-ux baseurl=…>` in an answer must not boot a client against another origin).
        installDataHtmlHooks(DOMPurify as never)
        const html = DOMPurify.sanitize(await marked.parse(content), dataHtmlPolicy()) as unknown as string
        this.innerHTML = this.hasAttribute('no-remote-images') ? withoutRemoteImages(html) : html
    }
}

/**
 * The HTML with every image that would be FETCHED (not a `data:` one) turned into its alt text (S13):
 * in an assistant's answer, text the model was steered into writing could name an image URL that
 * carries state values in its query — a request leaving the tab with no click. Redwood's chat does
 * the same. Inline `data:` images (a diagram the agent drew) fetch nothing and stay.
 */
export const withoutRemoteImages = (html: string): string => {
    if (typeof document === 'undefined') return html
    const template = document.createElement('template')
    template.innerHTML = html
    // not only <img> (GA review 2, N-6): media elements, <picture> sources, an SVG <image>/<use>/
    // <feImage>, the `background`/`poster`/`srcset` attributes and a `url(…)` in an inline style all
    // fetch with no click. The media go; a <picture> keeps its <img> (judged like any other).
    for (const el of Array.from(template.content.querySelectorAll('*'))) {
        const tag = el.localName.toLowerCase()
        if (REMOTE_MEDIA_TAGS.has(tag)) { el.remove(); continue }
        if (tag === 'picture') { el.replaceWith(...Array.from(el.childNodes)); continue }
        if (SVG_FETCHING_TAGS.has(tag) && el.namespaceURI === SVG_NS) {
            const href = (el.getAttribute('href') ?? el.getAttribute('xlink:href') ?? '').trim()
            if (!/^(data:|#)/i.test(href) || !href) { el.remove(); continue }
        }
        for (const attr of Array.from(el.attributes)) {
            const name = attr.name.toLowerCase()
            if (FETCHING_ATTRIBUTES.has(name)) el.removeAttribute(attr.name)
            else if (name === 'style' && /url\s*\(|image-set|@import|\\/i.test(attr.value)) el.removeAttribute(attr.name)
        }
    }
    template.content.querySelectorAll('img').forEach((img) => {
        const src = (img.getAttribute('src') ?? '').trim()
        if (/^data:/i.test(src)) return
        img.replaceWith(document.createTextNode(img.getAttribute('alt') ?? ''))
    })
    return template.innerHTML
}

const SVG_NS = 'http://www.w3.org/2000/svg'
/** Elements that fetch what they name and that a chat answer never needs. */
const REMOTE_MEDIA_TAGS = new Set(['video', 'audio', 'source', 'track', 'embed', 'object', 'iframe', 'frame', 'link', 'meta', 'base'])
/** SVG elements that fetch their `href` (a `data:` one or a local `#id` fetches nothing). */
const SVG_FETCHING_TAGS = new Set(['image', 'use', 'feimage', 'script'])
/** Attributes that make an element fetch (`srcset` included: it is dropped, so an img's own `src` decides). */
const FETCHING_ATTRIBUTES = new Set(['background', 'poster', 'srcset', 'lowsrc', 'dynsrc', 'longdesc', 'ping'])

if (typeof customElements !== 'undefined' && !customElements.get('mateu-markdown')) {
    customElements.define('mateu-markdown', MateuMarkdown)
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-markdown': MateuMarkdown
    }
}
