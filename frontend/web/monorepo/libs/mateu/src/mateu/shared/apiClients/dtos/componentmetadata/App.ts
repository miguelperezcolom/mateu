import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant";

export default interface App extends ComponentMetadata {

    route: string
    variant: AppVariant
    title: string | undefined
    subtitle: string | undefined
    logo: string | undefined
    favicon: string | undefined
    menu: MenuOption[]
    totalMenuOptions: number
    homeRoute: string
    style: string | undefined
    cssClasses: string | undefined
    drawerClosed: boolean
    initialRoute: string
    appServerSideType: string

}