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
