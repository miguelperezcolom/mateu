import { Subscription } from "rxjs";
import { upstream } from "@domain/state";
import Message from "@mateu/shared/apiClients/dtos/Message";
import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import MessageWrapper from "@domain/MessageWrapper";

export default abstract class ConnectedElement extends LitElement {

    // public properties
    @property()
    id = ''

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((messageWrapper: MessageWrapper) => {
            if (messageWrapper.message) {
                const message = messageWrapper.message
                if (this.id == message.targetComponentId) {
                    this.stampState(message)
                }

            }
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    abstract stampState(message: Message):void
}