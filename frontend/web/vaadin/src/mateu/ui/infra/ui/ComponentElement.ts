import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";

export default abstract class ComponentElement extends MetadataDrivenElement {

    // public properties

    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (this.id == fragment.targetComponentId) {
            if (fragment.component?.metadata) {
                this.metadata = fragment.component?.metadata
            }
            if (fragment.component) {
                this.component = fragment.component
            }
            if (fragment.data) {
                this.data = fragment.data
            }
            if (fragment.component?.serverSideType) {
                this.serverSideType = fragment.component?.serverSideType
            }
            /*
            if (JSON.stringify(this.metadata) != JSON.stringify(state.components[this.id]?.metadata)) {
                this.metadata = {...state.components[this.id].metadata}
            }
             */
        }
    }

}