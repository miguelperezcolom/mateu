import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import { property } from "lit/decorators.js";

export default abstract class ComponentElement extends MetadataDrivenElement {

    // public properties
    @property()
    values: Record<string, any> = {}

    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (this.id == fragment.targetComponentId) {
            if (fragment.component) {
                this.component!.children = fragment.component.children
            }
            if (fragment.data) {
                this.values = fragment.data
            } else {
                this.values = {}
            }
            console.log('values', this.values)
            this.requestUpdate()
        }
    }

}