import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";
import PeerNav from "@mateu/shared/apiClients/dtos/componentmetadata/PeerNav.ts";
import {ComponentState} from "@infra/ui/renderers/types.ts";

export default interface Drawer extends ComponentMetadata {

    id: string
    headerTitle: string
    subtitle?: string
    header: Component
    content: Component
    footer: Component
    position: 'start' | 'end' | 'bottom'
    width: string
    size?: 's' | 'm' | 'l' | 'xl'
    maximizable?: boolean
    collapsible?: boolean
    peerNav?: PeerNav
    noPadding: boolean
    modeless: boolean
    initialData: ComponentState

}
