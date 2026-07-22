import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import EmptyState from "@mateu/shared/apiClients/dtos/componentmetadata/EmptyState";
import Skeleton from "@mateu/shared/apiClients/dtos/componentmetadata/Skeleton";
import { html, nothing, TemplateResult } from "lit";
import "@infra/ui/mateu-skeleton.ts";

const requestAction = (event: Event, actionId?: string) => {
    if (!actionId) {
        return
    }
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId },
        bubbles: true,
        composed: true
    }))
}

/**
 * Shared empty-state block: used by the EmptyState component renderer and by grids/listings
 * when they have no rows.
 */
export const emptyStateTemplate = (message?: string, icon?: string, title?: string, description?: string, actionId?: string, actionLabel?: string): TemplateResult => {
    return html`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${icon ?? '🗂'}</span>
            ${title?html`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${title}</span>`:nothing}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${description ?? message ?? 'Nothing here yet.'}</span>
            ${actionId && actionLabel?html`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${(e: Event) => requestAction(e, actionId)}">${actionLabel}</button>
            `:nothing}
        </div>
    `
}

export const renderEmptyState = (component: ClientSideComponent) => {
    const metadata = component.metadata as EmptyState
    return html`
        <div style="${component.style??nothing}" class="${component.cssClasses??nothing}" slot="${component.slot??nothing}">
            ${emptyStateTemplate(undefined, metadata.icon, metadata.title, metadata.description, metadata.actionId, metadata.actionLabel)}
        </div>
    `
}

export const renderSkeleton = (component: ClientSideComponent) => {
    const metadata = component.metadata as Skeleton
    return html`
        <mateu-skeleton
                variant="${metadata.variant ?? 'text'}"
                count="${metadata.count && metadata.count > 0 ? metadata.count : 3}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-skeleton>
    `
}
