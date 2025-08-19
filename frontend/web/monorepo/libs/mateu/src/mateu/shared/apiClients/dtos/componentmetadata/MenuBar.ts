import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";

export default interface MenuBar extends ComponentMetadata {

    options: MenuOption[]

}