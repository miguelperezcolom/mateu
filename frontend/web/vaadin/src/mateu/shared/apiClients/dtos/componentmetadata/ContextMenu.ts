import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface ContextMenu extends ComponentMetadata {

    menu: MenuOption[]
    wrapped: Component
    activateOnLeftClick: boolean

}