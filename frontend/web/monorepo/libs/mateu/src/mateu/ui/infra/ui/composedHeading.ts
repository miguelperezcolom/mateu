import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

/**
 * The page heading of a COMPOSED archetype (a Dashboard, a SmartSearchPage, an ItemOverview…): its
 * tree has no Page, so nothing drew its title on the web — the page started straight with the KPI
 * band or the search box. The page names itself through its window title (SetWindowTitle, sent on
 * every route load), which is what the Redwood shell's header already shows (owner, 2026-10-12:
 * Vaadin shows it too).
 */

let currentTitle = typeof document !== 'undefined' ? document.title : ''

/** Called when a SetWindowTitle command is applied: the headings on screen follow it. */
export const windowTitleChanged = (title: string) => {
    currentTitle = title ?? ''
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mateu-window-title', { detail: currentTitle }))
    }
}

/** The page types of the composed archetypes (PageTypeResolver families). */
const COMPOSED_TYPES = new Set(['dashboard', 'collection', 'detail'])

/** What already names the page: a Page/Crud header, a hero, an entity header, a composed title or a heading Text. */
const NAMING_TYPES = new Set(['Page', 'App', 'HeroSection', 'EntityHeader', 'Wizard'])

type Node = { type?: string, id?: string, route?: string, pageType?: string,
    metadata?: { type?: string, title?: unknown, container?: string, text?: unknown }, children?: Node[] }

/** A Text drawn as a page-level heading (h1/h2) with something in it: the page wrote its own title. */
const isHeadingText = (n: Node) =>
    n.metadata?.type === 'Text'
    && (n.metadata.container === 'h1' || n.metadata.container === 'h2')
    && typeof n.metadata.text === 'string' && n.metadata.text.trim() !== ''

const named = (n: Node | undefined, depth = 0): boolean => {
    if (!n || depth > 12) return false
    const type = n.metadata?.type
    if (type && NAMING_TYPES.has(type)) return true
    // a listing — or a YAML Form (its header: a page filling a template is a detail/collection page
    // since its type follows the template) — names the page only when it carries a title of its own;
    // without this a templated record page got its window title ("13") drawn above its own header
    if ((type === 'Crud' || type === 'Form') && typeof n.metadata?.title === 'string' && n.metadata.title.trim()) return true
    if (type === 'Text' && typeof n.id === 'string' && n.id.endsWith('page-title')) return true
    // a YAML/fluent page that opens with its own h1/h2 (e.g. `{type: Text, container: h2}`)
    if (isHeadingText(n)) return true
    // a nested server-side component (an island) names only itself
    if (depth > 0 && n.type === 'ServerSide') return false
    return (n.children ?? []).some(c => named(c, depth + 1))
}

/**
 * Whether a server-side component is a composed page that draws no heading of its own: one of the
 * composed families, routed (not an embedded island) and with nothing in its tree naming it.
 */
export const needsComposedHeading = (component: Node | undefined): boolean => {
    if (!component || component.type !== 'ServerSide') return false
    if (!component.pageType || !COMPOSED_TYPES.has(component.pageType)) return false
    if ((component.route ?? '').includes('_embeddedMediator')) return false
    return !named(component)
}

@customElement('mateu-composed-heading')
export class MateuComposedHeading extends LitElement {

    @state() title = currentTitle

    static styles = css`
        :host { display: block; }
        h2 {
            margin: 0 0 var(--lumo-space-m, 1rem) 0;
            font-size: var(--lumo-font-size-xxl, 1.75rem);
            font-weight: 600;
            color: var(--lumo-header-text-color, inherit);
        }
    `

    private readonly onTitle = (e: Event) => { this.title = (e as CustomEvent).detail ?? '' }

    connectedCallback() {
        super.connectedCallback()
        this.title = currentTitle
        window.addEventListener('mateu-window-title', this.onTitle)
    }

    disconnectedCallback() {
        window.removeEventListener('mateu-window-title', this.onTitle)
        super.disconnectedCallback()
    }

    render() {
        return this.title ? html`<h2>${this.title}</h2>` : html``
    }
}
