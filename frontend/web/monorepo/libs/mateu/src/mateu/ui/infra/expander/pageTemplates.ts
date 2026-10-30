/**
 * A `type: Form` that fills a design-system page template (`template:`), laid out in the BROWSER the
 * way the server's PageTemplates (core, fragmentmapper) lays it out: the template's slots become
 * ordinary components, each in a container whose id names the slot, and the template's own values
 * ride on the Form metadata (`template: {type, avatar, photo}`) for a renderer that has the template
 * itself (Redwood paints Spectra's). Pinned by the Java goldens (PageTemplateSyncTest).
 */
import type { FluentNode } from './expandComponent.ts'

type Node = Record<string, unknown>

const nodes = (value: unknown): FluentNode[] =>
    Array.isArray(value) ? value as FluentNode[] : value && typeof value === 'object' ? [value as FluentNode] : []

const filled = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

const image = (value: unknown): Node | null => {
    if (!value || typeof value !== 'object') return null
    const v = value as Node
    return { src: v.src ?? null, initials: v.initials ?? null }
}

/** The template's own values, for the Form metadata; undefined for a free page or an unknown template. */
export function templateMetadataOf(template: unknown): Node | undefined {
    const t = template as Node | undefined
    if (!t) return undefined
    if (t.type === 'ItemOverviewPage') return { type: 'ItemOverviewPage', avatar: image(t.avatar), photo: image(t.photo) }
    if (t.type === 'WelcomePage') return { type: 'WelcomePage', avatar: null, photo: null }
    if (t.type === 'DashboardLandingPage') return { type: 'DashboardLandingPage', avatar: null, photo: null }
    if (t.type === 'GeneralOverviewPage') return { type: 'GeneralOverviewPage', avatar: null, photo: null }
    if (t.type === 'CollectionDetailPage') return { type: 'CollectionDetailPage', avatar: null, photo: null }
    if (t.type === 'FoldoutPage') return { type: 'FoldoutPage', avatar: null, photo: null }
    if (t.type === 'MultimediaContentPage') return { type: 'MultimediaContentPage', avatar: null, photo: null }
    if (t.type === 'AdvancedCreateEditPage') return { type: 'AdvancedCreateEditPage', avatar: null, photo: null }
    return undefined
}

/**
 * Whether the template draws the page's header itself (its title, subtitle and actions live in the
 * template's banner): the Form then carries no header and no toolbar of its own (PageTemplates.ownsHeader).
 */
export function ownsHeader(template: unknown): boolean {
    const t = template as Node | undefined
    return !!t && (t.type === 'WelcomePage' || t.type === 'MultimediaContentPage')
}

/** The page's content: the template laid out, or the authored content of a free page. `form` is the
 *  authored Form (its title, subtitle, overline, toolbar), which some templates draw. */
export function contentOf(template: unknown, content: unknown, form: Node = {}): unknown {
    const t = template as Node | undefined
    if (!t) return content
    if (t.type === 'ItemOverviewPage') return [itemOverview(t, nodes(content))]
    if (t.type === 'WelcomePage') return banner('welcome', t, nodes(content), form)
    if (t.type === 'MultimediaContentPage') return banner('multimedia-banner', t, nodes(content), form)
    if (t.type === 'DashboardLandingPage') return dashboard(t, nodes(content))
    if (t.type === 'GeneralOverviewPage') return [generalOverview(t, nodes(content))]
    if (t.type === 'CollectionDetailPage') return [collectionDetail(t, nodes(content))]
    if (t.type === 'FoldoutPage') return [foldout(t, nodes(content))]
    if (t.type === 'AdvancedCreateEditPage') return advancedCreateEdit(t, nodes(content))
    return content
}

const TONES = ['ocean', 'pine', 'lilac', 'teal', 'rose', 'pebble', 'slate', 'plum', 'sienna']

/** Spectra's `dark-<tone>` (or the bare tone) → the hero's tone; auto/unknown → none (WelcomePage.toneOrNull). */
function toneOf(backgroundColor: unknown): string | undefined {
    if (!filled(backgroundColor)) return undefined
    const tone = backgroundColor.trim().replace(/^dark-/, '').toLowerCase()
    return TONES.includes(tone) ? tone : undefined
}

/** A welcome-style banner (the form's title/subtitle/overline, its toolbar as the calls to action)
 *  over the content — the Welcome archetype's centred HeroSection (PageTemplates.banner): the welcome
 *  page's tiles, the multimedia content page's sections. */
function banner(id: string, t: Node, tiles: FluentNode[], form: Node): FluentNode[] {
    const tone = toneOf(t.backgroundColor)
    const hero: Node = {
        type: 'HeroSection', id, centered: true,
        style: 'width: 100%; box-sizing: border-box; margin-bottom: 1rem',
        content: nodes(form.toolbar),
    }
    if (form.title !== undefined) hero.title = form.title
    if (form.subtitle !== undefined) hero.subtitle = form.subtitle
    if (form.overline !== undefined) hero.overline = form.overline
    if (tone) hero.tone = tone
    return [hero as unknown as FluentNode, ...tiles]
}

const slot = (id: string, content: FluentNode[], style?: string): FluentNode =>
    ({ type: 'VerticalLayout', id, content, ...(style ? { style } : {}) }) as FluentNode

function media(t: Node): FluentNode | null {
    const avatar = t.avatar as Node | undefined
    if (avatar && filled(avatar.src)) {
        return { type: 'Image', src: avatar.src, style: 'width: 8rem; height: 8rem; border-radius: 50%; object-fit: cover' } as FluentNode
    }
    if (avatar && filled(avatar.initials)) {
        return { type: 'Avatar', abbreviation: avatar.initials, style: 'width: 8rem; height: 8rem' } as FluentNode
    }
    const photo = t.photo as Node | undefined
    if (photo && filled(photo.src)) {
        return { type: 'Image', src: photo.src, style: 'width: 100%; aspect-ratio: 4 / 3; object-fit: cover' } as FluentNode
    }
    return null
}

function itemOverview(t: Node, main: FluentNode[]): FluentNode {
    const panel: FluentNode[] = []
    const m = media(t)
    if (m) panel.push(slot('item-overview-media', [m], 'width: 100%; align-items: center'))
    panel.push(slot('item-overview-body', nodes(t.body), 'width: 100%'))
    const footer = nodes(t.footer)
    if (footer.length) panel.push(slot('item-overview-footer', footer, 'width: 100%'))
    return {
        type: 'HorizontalLayout', id: 'item-overview', wrap: true, spacing: true,
        content: [
            {
                type: 'Card', id: 'item-overview-panel',
                content: slot('item-overview-panel-content', panel, 'width: 100%'),
                style: 'flex: 0 0 22rem; max-width: 100%; position: sticky; top: 0; align-self: flex-start',
            },
            slot('item-overview-main', main, 'flex: 1 1 24rem; min-width: min(24rem, 100%)'),
        ],
    } as unknown as FluentNode
}

/** Dashboard landing page: the `kpi` slot's metrics as one Scoreboard band over the panels on the
 *  dashboard grid — the Dashboard archetype's shape; a non-metric component in the slot follows the band. */
function dashboard(t: Node, main: FluentNode[]): FluentNode[] {
    const kpi = nodes(t.kpi)
    const metrics = kpi.filter((c) => (c as Node).type === 'MetricCard')
    const others = kpi.filter((c) => (c as Node).type !== 'MetricCard')
    const page: FluentNode[] = []
    if (metrics.length) page.push({ type: 'Scoreboard', id: 'dashboard-kpi', metrics } as unknown as FluentNode)
    page.push(...others)
    page.push({ type: 'DashboardLayout', id: 'dashboard-panels', items: main } as unknown as FluentNode)
    return page
}

/** General overview: the main slot beside the complementary `info` panel (PageTemplates.generalOverview). */
function generalOverview(t: Node, main: FluentNode[]): FluentNode {
    const info = nodes(t.info)
    const columns: FluentNode[] = [slot('general-overview-main', main, 'flex: 2 1 32rem; min-width: min(32rem, 100%)')]
    if (info.length) columns.push(slot('general-overview-info', info, 'flex: 1 1 16rem; min-width: min(16rem, 100%)'))
    return { type: 'HorizontalLayout', id: 'general-overview', wrap: true, spacing: true, content: columns } as unknown as FluentNode
}

/** Collection detail: the collection (`list`) beside the selected item's detail (the content) — or,
 *  with no content, the `noSelection` slot (PageTemplates.collectionDetail). */
function collectionDetail(t: Node, detail: FluentNode[]): FluentNode {
    const side = 'flex: 1 1 24rem; min-width: min(24rem, 100%)'
    return {
        type: 'HorizontalLayout', id: 'collection-detail', wrap: true, spacing: true,
        content: [
            slot('collection-detail-list', nodes(t.list), 'flex: 0 0 24rem; max-width: 100%'),
            detail.length ? slot('collection-detail-detail', detail, side) : slot('collection-detail-no-selection', nodes(t.noSelection), side),
        ],
    } as unknown as FluentNode
}

/** Foldout: one FoldoutLayout — the `overview` slot, the form's FoldoutPanels as its panels (any other
 *  content component becomes an untitled open panel); the page header stays the form's
 *  (PageTemplates.foldout). The expander then lays the layout out as FoldoutLayoutMapper does. */
function foldout(t: Node, content: FluentNode[]): FluentNode {
    const panels = content.map((c, i) => ((c as Node).type === 'FoldoutPanel'
        ? c : { type: 'FoldoutPanel', id: 'panel' + i, open: true, content: c } as unknown as FluentNode))
    const node: Node = { type: 'FoldoutLayout', id: 'foldout', overview: slot('foldout-overview', nodes(t.overview), 'width: 100%'), panels }
    if (t.orientation !== undefined) node.orientation = t.orientation
    return node as unknown as FluentNode
}

/** Advanced create and edit: the main slot (the content) — and, with a `detail`, the detail beside it
 *  as an @Aside's named slots `"main aside"` of one responsive grid (PageTemplates.advancedCreateEdit). */
function advancedCreateEdit(t: Node, main: FluentNode[]): FluentNode[] {
    const detail = nodes(t.detail)
    if (!detail.length) return main
    const region = (slotName: string, content: FluentNode[]) =>
        ({ type: 'VerticalLayout', slot: slotName, content, fullWidth: true, horizontalAlignment: 'STRETCH', spacing: true }) as unknown as FluentNode
    return [{
        type: 'ResponsiveGrid', id: 'advanced-create-edit', gridTemplateColumns: '1fr 22rem', stackBelow: '48rem',
        gridTemplateAreas: '"main aside"', stickyAreas: [], reorderable: false,
        content: [region('main', main), region('aside', detail)],
    } as unknown as FluentNode]
}
