import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'

/**
 * Where an app shell loads its CONTENT from, and which view it names there. Pure, so the rules a
 * federated shell depends on are pinned by tests (appContentTarget.test.ts) instead of living in
 * the renderer.
 */

/**
 * The base an app's own content has to be fetched with.
 *
 * `homeBaseUrl` is what an app calls itself FROM ITS OWN ORIGIN. For an app aggregated by a shell
 * that is not where the browser reached it, and taking it verbatim sent that app's content back to
 * the SHELL — the "not found" you get from pasting a link to a page inside a federated app. So the
 * base the browser actually used wins, unless the app names an ABSOLUTE one: a different host,
 * which only the app can know (a shell whose fresh deep link mounted a remote screen as its home).
 */
export const reachableBaseUrl = (app: Pick<App, 'homeBaseUrl'>, reachedAt: string | undefined): string | undefined =>
    (app.homeBaseUrl ?? '').includes('://') ? app.homeBaseUrl : (reachedAt || app.homeBaseUrl)

/** What the shell has selected (a menu option, or the home the server mounted). */
export interface SelectedContent {
    selectedRoute?: string
    selectedBaseUrl?: string
    selectedServerSideType?: string
    baseUrl?: string
}

/**
 * The base the content is loaded from. Before anything is selected (the first frame of a fresh deep
 * link) it is the home's: the shell's own base — unless the server mounted a REMOTE screen as the
 * home (an absolute `homeBaseUrl`). Taking the shell's base there sent a bookmarked remote screen
 * to the SHELL's backend with the remote's view type, which answered 403.
 */
export const contentBaseUrl = (container: SelectedContent, metadata: Pick<App, 'homeBaseUrl'>): string | undefined => {
    if (container.selectedRoute) {
        return container.selectedBaseUrl ?? container.baseUrl
    }
    return reachableBaseUrl(metadata, container.baseUrl)
}

/** A base url that is not the shell's own: the selected content lives in another backend. */
const isForeign = (base: string | undefined, own: string | undefined): boolean =>
    !!base && trimSlash(base) !== trimSlash(own ?? '')

const trimSlash = (url: string) => url.replace(/\/+$/, '')

/**
 * The view type named on the content load. A menu option of a REMOTE (its own base url) names the
 * remote's type, or none at all — a YAML-only remote has no view class, and its leaves carry no
 * type. Falling back to the shell's own type there sent the SHELL's class name to the remote,
 * which refused it (403): only for an option of the shell's own backend does the shell's type
 * stand in.
 */
export const contentServerSideType = (container: SelectedContent, metadata: Pick<App, 'serverSideType' | 'homeServerSideType'>): string | undefined => {
    if (container.selectedRoute) {
        if (container.selectedServerSideType) return container.selectedServerSideType
        return isForeign(container.selectedBaseUrl, container.baseUrl) ? undefined : metadata.serverSideType
    }
    return metadata.homeServerSideType
}
