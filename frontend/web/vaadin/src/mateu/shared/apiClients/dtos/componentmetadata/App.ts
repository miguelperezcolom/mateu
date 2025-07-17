import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant";

export default interface App extends ComponentMetadata {

    route: string
    variant: AppVariant
    title: string | undefined
    subtitle: string | undefined
    menu: MenuOption[]
    homeRoute: string
    style: string | undefined

}