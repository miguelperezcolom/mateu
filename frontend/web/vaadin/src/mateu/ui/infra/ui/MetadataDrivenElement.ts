import ConnectedElement from "@infra/ui/ConnectedElement";
import { property } from "lit/decorators.js";
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
    data: any


}