import { Subscription } from "rxjs";
import { upstream } from "@domain/state";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import Message from "@domain/Message";

export default abstract class ConnectedElement extends LitElement {

    // public properties
    @property()
    id = ''

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((message: Message) => {
            if (message.fragment) {
                const fragment = message.fragment
                if (this.id == fragment.targetComponentId) {
                    this.applyFragment(fragment)
                }

            }
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    abstract applyFragment(fragment: UIFragment):void
}