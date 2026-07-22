import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ConfirmDialog from "@mateu/shared/apiClients/dtos/componentmetadata/ConfirmDialog";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolateAndEvaluate } from "@infra/ui/interpolation.ts";

/*
 * Design-system-neutral ConfirmDialog — a native modal (backdrop + card) with confirm/reject/cancel
 * buttons wired to their action ids (no `@vaadin`). The Vaadin adapter overrides it with
 * vaadin-confirm-dialog. NOTE: this native version wires confirmActionId/rejectActionId/cancelActionId
 * (like the sapui5 renderer already did) — the old vaadin-confirm-dialog path never dispatched them.
 */
const dispatchAction = (target: EventTarget | null, actionId?: string) => {
    if (!target) return
    ;(target as Element).dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId }, bubbles: true, composed: true,
    }))
}

const BTN = 'font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);'
const SECONDARY = `${BTN} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`
const PRIMARY = `${BTN} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`

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
    if (!opened) {
        return html``
    }
    return html`
        <div class="mateu-confirm-dialog ${component.cssClasses ?? ''}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${component.style ?? ''}"
             slot="${component.slot ?? nothing}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${metadata.header ? html`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${metadata.header}</h3>` : nothing}
                <div>${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${metadata.canCancel ? html`<button style="${SECONDARY}" @click="${(e: Event) => dispatchAction(e.currentTarget, metadata.cancelActionId)}">${metadata.rejectText && !metadata.canReject ? metadata.rejectText : 'Cancel'}</button>` : nothing}
                    ${metadata.canReject ? html`<button style="${SECONDARY}" @click="${(e: Event) => dispatchAction(e.currentTarget, metadata.rejectActionId)}">${metadata.rejectText || 'No'}</button>` : nothing}
                    <button style="${PRIMARY}" @click="${(e: Event) => dispatchAction(e.currentTarget, metadata.confirmActionId)}">${metadata.confirmText || 'OK'}</button>
                </div>
            </div>
        </div>
    `
}
