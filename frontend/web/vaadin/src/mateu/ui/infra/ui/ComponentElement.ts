import { PropertyValues } from "lit";
import { State, store } from "@domain/state";
import ConnectedElement from "@infra/ui/ConnectedElement";
import { property, state } from "lit/decorators.js";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default abstract class ComponentElement extends ConnectedElement {

    // public properties
    @property()
    id = ''

    @state()
    metadata: ComponentMetadata | undefined = undefined

    protected update(changedProperties: PropertyValues) {
        if (changedProperties.has('id')) {
            this.stampState({...store.state})
        }
        if (changedProperties.has('metadata')) {
            super.update(changedProperties);
        }
    }

    // write state to reactive properties
    stampState(state: State) {
        if (JSON.stringify(this.metadata) != JSON.stringify(state.components[this.id].metadata)) {
            this.metadata = {...state.components[this.id].metadata}
        }
    }

}