import ConnectedElement from "@infra/ui/ConnectedElement";
import { property } from "lit/decorators.js";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";

export default abstract class ComponentElement extends ConnectedElement {

    // public properties

    @property()
    metadata: ComponentMetadata | undefined

    @property()
    serverSideType: string | undefined

    @property()
    data: any


    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (this.id == fragment.targetComponentId) {
            if (fragment.component?.metadata) {
                this.metadata = fragment.component?.metadata
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