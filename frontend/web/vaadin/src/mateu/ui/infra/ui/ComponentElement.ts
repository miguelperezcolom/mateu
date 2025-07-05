import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import { property } from "lit/decorators.js";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";

export default abstract class ComponentElement extends MetadataDrivenElement {

    // public properties
    @property()
    values: Record<string, any> = {}

    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (this.id == fragment.targetComponentId) {
            if (fragment.component) {
                const children = fragment.component?.type == ComponentType.ServerSide?fragment.component?.children:[fragment.component]
                this.component!.children = children
            }
            if (fragment.data) {
                this.values = { ...this.values, ...fragment.data }
            }
            this.requestUpdate()
        }
    }

}