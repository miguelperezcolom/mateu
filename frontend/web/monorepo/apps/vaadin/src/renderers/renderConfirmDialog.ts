import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ConfirmDialog from "@mateu/shared/apiClients/dtos/componentmetadata/ConfirmDialog";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolateAndEvaluate } from "@infra/ui/interpolation.ts";

/**
 * Vaadin adapter ConfirmDialog → vaadin-confirm-dialog. Lives in apps/vaadin so the core stays
 * @vaadin-free; registered by VaadinComponentRenderer (the core renders a native modal). The confirm/
 * reject/cancel buttons dispatch their action ids (parity with the native renderers).
 */
// Answered once: the dialog is dismissed (a ConfirmDialog an action RETURNS has no openedCondition
// to turn false), and its ids were named by the server in an answer to the enclosing component —
// which may not advertise them (see mateu-component's `serverNamed`).
const dismissed = new WeakSet<object>()
const dispatchAction = (target: EventTarget | null, actionId: string | undefined, metadata: object,
                        container: LitElement) => {
    dismissed.add(metadata)
    container.requestUpdate()
    if (!target || !actionId) return
    ;(target as Element).dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, serverNamed: true }, bubbles: true, composed: true,
    }))
}

export const renderConfirmDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as ConfirmDialog
    // no condition = open: a ConfirmDialog returned by an action is shown as soon as it arrives
    let opened = !metadata.openedCondition;
    if (metadata.openedCondition) {
        try {
            opened = interpolateAndEvaluate(metadata.openedCondition, state, data, appState, appData) as boolean
        } catch (e) {
            console.error('when evaluating ' + metadata.openedCondition + ' :' + e + ', where data is ' + data
                + ' and state is ' + state)
        }
    }
    // answered: closed until the server sends this dialog again (a new metadata object)
    if (dismissed.has(metadata)) opened = false
    return html`
        <vaadin-confirm-dialog
                header="${metadata.header}"
                ?cancel-button-visible="${metadata.canCancel}"
                ?reject-button-visible="${metadata.canReject}"
                reject-text="${metadata.rejectText}"
                confirm-text="${metadata.confirmText}"
                .opened="${opened}"
                @confirm="${(e: Event) => dispatchAction(e.currentTarget, metadata.confirmActionId, metadata, container)}"
                @reject="${(e: Event) => dispatchAction(e.currentTarget, metadata.rejectActionId, metadata, container)}"
                @cancel="${(e: Event) => dispatchAction(e.currentTarget, metadata.cancelActionId, metadata, container)}"
                style="${component.style}" class="${component.cssClasses}"
                slot="${component.slot??nothing}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </vaadin-confirm-dialog>
    `
}
