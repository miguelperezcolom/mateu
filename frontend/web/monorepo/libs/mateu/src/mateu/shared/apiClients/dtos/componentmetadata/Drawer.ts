import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";
import {ComponentState} from "@infra/ui/renderers/types.ts";

export default interface Drawer extends ComponentMetadata {

    id: string
    headerTitle: string
    header: Component
    content: Component
    footer: Component
    position: 'start' | 'end'
    width: string
    noPadding: boolean
    modeless: boolean
    initialData: ComponentState

}
