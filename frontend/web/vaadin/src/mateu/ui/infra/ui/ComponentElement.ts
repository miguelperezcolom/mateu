import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";

export default abstract class ComponentElement extends MetadataDrivenElement {

    // public properties

    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        console.log('applying', fragment)
        if (this.id == fragment.targetComponentId) {
            if (fragment.component) {
                this.component!.children = [fragment.component]
            }
            if (fragment.data) {
                this.data = fragment.data
            }
            this.requestUpdate()
        }
    }

}