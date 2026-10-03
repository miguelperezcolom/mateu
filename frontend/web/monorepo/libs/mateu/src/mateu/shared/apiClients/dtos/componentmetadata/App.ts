import type RestSourceEntry from './RestSourceEntry.ts'
import type RestDataSource from "@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource";
import type Component from "@mateu/shared/apiClients/dtos/Component";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant";
import Fab from "@mateu/shared/apiClients/dtos/componentmetadata/Fab";
import AppContextSelector from "./AppContextSelector.ts"
import AppHeaderAction from "@mateu/shared/apiClients/dtos/componentmetadata/AppHeaderAction.ts";

export default interface App extends ComponentMetadata {

    route: string
    variant: AppVariant
    layout: string
    title: string | undefined
    subtitle: string | undefined
    logo: string | undefined
    favicon: string | undefined
    menu: MenuOption[]
    // Client-side only, set by the remote-menu completion (ConnectedElement.completeMenu): the
    // whole navigation tree — the remote sections merged in, the hidden ones (visible: false)
    // kept — for what reads the menu rather than draws it (breadcrumbs, the active section).
    // `menu` is what the renderers draw: the same tree without the hidden entries.
    navMenu?: MenuOption[]
    totalMenuOptions: number
    homeRoute: string
    homeBaseUrl: string
    homeServerSideType: string
    homeUriPrefix: string
    homeConsumedRoute: string
    style: string | undefined
    cssClasses: string | undefined
    drawerClosed: boolean
    initialRoute: string
    serverSideType: string
    uriPrefix: string
    baseUrl: string
    sseUrl: string | undefined
    mcpUrl: string | undefined
    uploadUrl: string | undefined
    fabs: Fab[] | undefined
    themeToggle: boolean
    contextSelectors: AppContextSelector[] | undefined
    contextActions: AppHeaderAction[] | undefined
    rootRoute: string | undefined
    notificationsEnabled?: boolean
    globalSearchEnabled?: boolean
    commandCenterEnabled?: boolean
    chromeless?: boolean
    /** `@NoBreadcrumbs` on the shell: no automatic breadcrumb trail on its pages. */
    noBreadcrumbs?: boolean
    /** @App(askLabel): the brand of the shell's "ask" entry; absent = the renderer's own */
    askLabel?: string
    /** @App(askIcon): its icon (an initial, an image or an icon name); absent = the renderer's own */
    askIcon?: string
    /** @App(accentColor): the app's brand accent, a CSS colour (not the primary colour); absent = none */
    accentColor?: string
    /** The app's REST source catalogue: every named endpoint its screens reference, declared once.
     * App-wide configuration, so it arrives with the shell rather than on every response. */
    restSources?: RestSourceEntry[] | undefined

    /** The app's business-component catalogue (coherence-plan #13): every named composition its
     * screens reference by `ComponentRef`, already mapped to the wire. App-wide; it is what lets a
     * reference resolve in the browser (or the client-side expander) with no backend. */
    components?: { name: string; component: Component }[] | undefined

    /** The app's app-scope data source: the shell fetches it ONCE on boot into the app-data store,
     * shared across routes (declared by a mount's root route `appData` in routes.yaml). */
    appDataSource?: RestDataSource | undefined

    /** Capability tokens this app REQUIRES from whatever renderer/shell hosts it (see
     * infra/capabilities). The shell compares them against what this build PROVIDES and reports what
     * is missing instead of rendering a broken screen — compatibility by capability, not by version. */
    requiredCapabilities?: string[] | undefined

}