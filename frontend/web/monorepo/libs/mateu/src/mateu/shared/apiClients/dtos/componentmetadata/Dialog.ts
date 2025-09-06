import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface Dialog extends ComponentMetadata {

    headerTitle: string
    header: Component
    content: Component
    footer: Component
    noPadding: boolean
    modeless: boolean
    top: string
    left: string
    right: string
    draggable: boolean
    width: string
    height: string
    resizable: boolean
    closeButtonOnHeader: boolean

}