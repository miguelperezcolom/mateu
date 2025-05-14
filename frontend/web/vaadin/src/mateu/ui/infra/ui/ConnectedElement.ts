import { LitElement } from "lit";
import { Subscription } from "rxjs";
import { State, upstream } from "@domain/state";

export default abstract class ConnectedElement extends LitElement {

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    abstract stampState(state: State):void
}