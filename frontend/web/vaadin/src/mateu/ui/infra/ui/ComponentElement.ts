import ConnectedElement from "@infra/ui/ConnectedElement";
import { property } from "lit/decorators.js";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Message from "@mateu/shared/apiClients/dtos/Message";

export default abstract class ComponentElement extends ConnectedElement {

    // public properties

    @property()
    metadata: ComponentMetadata | undefined

    @property()
    data: any


    // write state to reactive properties
    stampState(message: Message) {
        if (this.id == message.targetComponentId) {
            if (message.component?.metadata) {
                this.metadata = message.component?.metadata
            }
            if (message.component?.data) {
                this.data = message.component?.data
            }
            /*
            if (JSON.stringify(this.metadata) != JSON.stringify(state.components[this.id]?.metadata)) {
                this.metadata = {...state.components[this.id].metadata}
            }
             */
        }
    }

}