import ConnectedElement from "@infra/ui/ConnectedElement";
import { property } from "lit/decorators.js";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";
import UIFragment from "@/mateu/shared/apiClients/dtos/UIFragment";

export default class MetadataDrivenElement extends ConnectedElement {

    applyFragment(_fragment: UIFragment): void {
        // do nothing
    }

    // public properties

    @property()
    component: Component | undefined

    @property()
    metadata: ComponentMetadata | undefined

    @property()
    serverSideType: string | undefined

    @property()
    data: any


}