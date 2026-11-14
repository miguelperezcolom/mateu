/**
 * The kind of page a YAML `template:` stands for — the same table as the server's
 * PageTypeResolver.ofTemplate. Dependency-free: the browser expander (also loaded by the React
 * Native app with plain Node) imports it.
 */
const TEMPLATE_PAGE_TYPES: Record<string, string> = {
    CollectionDetailPage: 'collection',
    DataManagementPage: 'collection',
    DashboardLandingPage: 'dashboard',
    WelcomePage: 'landing',
    HeroSearchPage: 'landing',
    MessagePage: 'landing',
    ItemOverviewPage: 'detail',
    GeneralOverviewPage: 'detail',
    FoldoutPage: 'detail',
    MultimediaContentPage: 'detail',
    GuidedProcessPage: 'process',
    AdvancedCreateEditPage: 'form',
}

/** The page type a template's type names, or undefined. */
export const templatePageType = (templateType: string | undefined): string | undefined =>
    templateType ? TEMPLATE_PAGE_TYPES[templateType] : undefined

/**
 * The template a routed view fills when its content IS a Form (bare, or in the envelopes of a
 * served YAML page): the Form's `template.type`, or undefined.
 */
export const pageTemplateOf = (component: unknown): string | undefined => {
    type Node = { type?: string, children?: unknown[], metadata?: { type?: string, template?: { type?: string } } }
    let node = component as Node | undefined
    while (node && node.type === 'ServerSide' && (node.children ?? []).length === 1) {
        node = node.children![0] as Node
    }
    const metadata = node?.metadata
    return metadata?.type === 'Form' ? metadata.template?.type : undefined
}

/** Whether a page draws the whole viewport itself, with no shell chrome around it: a MessagePage. */
export const pageOwnsViewport = (component: unknown): boolean => pageTemplateOf(component) === 'MessagePage'
