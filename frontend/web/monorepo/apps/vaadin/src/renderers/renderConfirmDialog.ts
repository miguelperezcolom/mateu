import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ConfirmDialog from "@mateu/shared/apiClients/dtos/componentmetadata/ConfirmDialog";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolateAndEvaluate } from "@infra/ui/interpolation.ts";

/**
 * Vaadin adapter ConfirmDialog → vaadin-confirm-dialog. Lives in apps/vaadin so the core stays
 * @vaadin-free; registered by VaadinComponentRenderer (the core renders a native modal). The confirm/
 * reject/cancel buttons dispatch their action ids (parity with the native + sapui5 renderers).
 */
const dispatchAction = (target: EventTarget | null, actionId?: string) => {
    if (!target) return
    ;(target as Element).dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId }, bubbles: true, composed: true,
    }))
}

export const renderConfirmDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as ConfirmDialog
    let opened = false;
    if (metadata.openedCondition) {
        try {
            opened = interpolateAndEvaluate(metadata.openedCondition, state, data, appState, appData) as boolean
        } catch (e) {
            console.error('when evaluating ' + metadata.openedCondition + ' :' + e + ', where data is ' + data
                + ' and state is ' + state)
        }
    }
    return html`
        <vaadin-confirm-dialog
                header="${metadata.header}"
                ?cancel-button-visible="${metadata.canCancel}"
                ?reject-button-visible="${metadata.canReject}"
                reject-text="${metadata.rejectText}"
                confirm-text="${metadata.confirmText}"
                .opened="${opened}"
                @confirm="${(e: Event) => dispatchAction(e.currentTarget, metadata.confirmActionId)}"
                @reject="${(e: Event) => dispatchAction(e.currentTarget, metadata.rejectActionId)}"
                @cancel="${(e: Event) => dispatchAction(e.currentTarget, metadata.cancelActionId)}"
                style="${component.style}" class="${component.cssClasses}"
                slot="${component.slot??nothing}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </vaadin-confirm-dialog>
    `
}
