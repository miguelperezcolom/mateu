import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import { property } from "lit/decorators.js";

export default abstract class ComponentElement extends MetadataDrivenElement {

    // public properties
    @property()
    values: Record<string, any> = {}

    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        console.log('applying', fragment)
        if (this.id == fragment.targetComponentId) {
            if (fragment.component) {
                this.component!.children = [fragment.component]
            }
            if (fragment.data) {
                this.values = fragment.data
                console.log('new data', this.values)
            }
            this.requestUpdate()
        }
    }

}