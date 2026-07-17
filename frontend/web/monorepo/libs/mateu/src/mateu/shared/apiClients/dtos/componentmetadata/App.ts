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

}