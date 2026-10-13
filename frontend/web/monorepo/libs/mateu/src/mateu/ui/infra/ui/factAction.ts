import { css, html, nothing, TemplateResult } from "lit";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";

/**
 * The optional action of an EntityHeader fact (the pencil next to "EMPRESA" / "Acme Corporation
 * Ltd"): a compact icon-only button right after the value, on the same line. Shared by the inline
 * banner (`mateu-entity-header`) and the page header the banner is hoisted into
 * (`mateu-content-header`, whose KPIs then carry the same fields).
 */
export interface FactActionSource {
    label?: string
    actionId?: string
    icon?: string
    actionLabel?: string
    parameters?: Record<string, unknown>
}

/** The icon when the wire names none (the servers already default it; this covers old ones). */
export const DEFAULT_FACT_ACTION_ICON = 'vaadin:pencil'

/** The button's accessible name and tooltip: its own label, else the fact's. */
export const factActionLabel = (fact: FactActionSource): string =>
    (fact.actionLabel && fact.actionLabel.trim()) || fact.label || ''

/**
 * Dispatches the fact's action exactly like a Button does (`handleButtonClick`): an
 * `action-requested` event FROM the clicked button — bubbling and composed, so it crosses the
 * header's shadow root and reaches the mateu-component that advertises the action — carrying
 * `actionId` and the fact's `parameters`.
 */
export const dispatchFactAction = (event: Event, fact: FactActionSource) => {
    const el = event.currentTarget as HTMLElement
    el.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: fact.actionId,
            parameters: fact.parameters,
        },
        bubbles: true,
        composed: true,
    }))
}

/** The icon-only button of a fact with an action; nothing for a display-only fact. */
export const renderFactAction = (fact: FactActionSource): TemplateResult | typeof nothing => {
    if (!fact.actionId) return nothing
    const label = factActionLabel(fact)
    return html`<button type="button" class="fact-action"
            data-action-id="${fact.actionId}"
            aria-label="${label || nothing}"
            title="${label || nothing}"
            @click="${(e: Event) => dispatchFactAction(e, fact)}"
    >${icon(fact.icon || DEFAULT_FACT_ACTION_ICON)}</button>`
}

/** The fact action button's look: a small, borderless, accent-colored icon button. */
export const factActionStyles = css`
    .fact-value-row {
        display: inline-flex; align-items: center; gap: .25rem; min-width: 0; max-width: 100%;
    }
    .fact-value-row > .value, .fact-value-row > .kpi-value, .fact-value-row > .header-fact-value {
        min-width: 0;
    }
    .fact-action {
        flex: 0 0 auto;
        display: inline-flex; align-items: center; justify-content: center;
        width: 1.6rem; height: 1.6rem; padding: 0; margin: 0;
        border: 0; border-radius: var(--lumo-border-radius-m, 6px);
        background: transparent; cursor: pointer;
        color: var(--lumo-primary-text-color, #1a73e8);
        font: inherit; font-size: var(--lumo-icon-size-s, 1rem); line-height: 1;
        --lumo-icon-size: var(--lumo-icon-size-s, 1rem);
    }
    .fact-action:hover { background: var(--lumo-primary-color-10pct, rgba(26, 115, 232, .1)); }
    .fact-action:focus-visible {
        outline: 2px solid var(--lumo-primary-color-50pct, rgba(26, 115, 232, .5));
        outline-offset: 1px;
    }
`
