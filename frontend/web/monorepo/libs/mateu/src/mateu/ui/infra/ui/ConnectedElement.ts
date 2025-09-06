import { Subscription } from "rxjs";
import { upstream } from "@domain/state";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import Message from "@domain/Message";
import UICommand from "@mateu/shared/apiClients/dtos/UICommand.ts";

export default abstract class ConnectedElement extends LitElement {

    // public properties
    @property()
    id = ''
    @property()
    baseUrl = ''

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((message: Message) => {
            if (message.command) {
                const command = message.command
                if (this.id == command.targetComponentId) {
                    this.applyCommand(command)
                }

            }
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

    abstract manageActionRequestedEvent(event: CustomEvent):void

    applyCommand(command: UICommand) {
        if ('NavigateTo' == command.type) {
            const destination = command.data as string
            if (destination) {
                if (destination.startsWith('http:') || destination.startsWith('https:')) {
                    window.location.href = command.data as string
                } else {
                    this.dispatchEvent(new CustomEvent('navigate-to-requested', {
                        detail: {
                            route: destination
                        },
                        bubbles: true,
                        composed: true
                    }))
                }
            }
        }
        if ('RunAction' == command.type) {
            const data = command.data as {
                actionId: string
            }
            if (data && data.actionId) {
                this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: data.actionId
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
    }

}