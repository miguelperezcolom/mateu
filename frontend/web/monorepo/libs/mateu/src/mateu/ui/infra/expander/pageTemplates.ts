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
    if (!t || t.type !== 'ItemOverviewPage') return undefined
    return { type: 'ItemOverviewPage', avatar: image(t.avatar), photo: image(t.photo) }
}

/** The page's content: the template laid out, or the authored content of a free page. */
export function contentOf(template: unknown, content: unknown): unknown {
    const t = template as Node | undefined
    if (!t || t.type !== 'ItemOverviewPage') return content
    return [itemOverview(t, nodes(content))]
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
