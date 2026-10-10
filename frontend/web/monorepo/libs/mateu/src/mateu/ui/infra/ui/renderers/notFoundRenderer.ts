import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import NotFound from "@mateu/shared/apiClients/dtos/componentmetadata/NotFound";
import { html, nothing, svg, TemplateResult } from "lit";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { icon as renderIcon } from "@infra/ui/renderers/neutralIcon.ts";
import { chromeText } from "@infra/ui/chromeTexts.ts";
import { navigateToRoute } from "@infra/ui/rowRoute.ts";
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { ifDefined } from 'lit/directives/if-defined.js'

/** A magnifying glass, for renderers with no icon hook (the port would draw an empty placeholder). */
const MAGNIFIER = svg`<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>`

const glyph = (): TemplateResult =>
    componentRenderer.get()?.renderIcon
        ? renderIcon('vaadin:search', 'width: 100%; height: 100%;')
        : html`${MAGNIFIER}`

/** The way back is an in-app navigation (the pair every shell honors), not a page load. */
const goBack = (event: Event, route: string) => {
    if ((event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey) {
        return // a new tab or window: let the link do it
    }
    event.preventDefault()
    navigateToRoute(event.currentTarget as HTMLElement, route)
}

/**
 * The not-found page: what a route renders in place of its content when the record or screen it
 * names does not exist — an icon, the heading (the server's message, e.g. «Reserva FO-X6JB7F no
 * encontrada»), a short line and the way back. Centered, and drawn only with the theme's tokens so
 * it follows light and dark.
 */
export const renderNotFound = (component: ClientSideComponent): TemplateResult => {
    const metadata = (component.metadata ?? {}) as NotFound
    const title = metadata.title || chromeText('notFound')
    const message = metadata.message || chromeText('notFoundMessage')
    const backRoute = metadata.backRoute
    return html`
        <section class="mateu-not-found ${component.cssClasses ?? ''}"
                 slot="${component.slot ?? nothing}"
                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                        gap: var(--lumo-space-s, .5rem); min-height: 50vh; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-m, 1rem);
                        color: var(--lumo-secondary-text-color, #5f6b7a); ${component.style ?? ''}">
            <span class="mateu-not-found-icon" aria-hidden="true"
                  style="display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
                         width: 4.5rem; height: 4.5rem; padding: 1.1rem; margin-bottom: var(--lumo-space-s, .5rem); border-radius: 50%;
                         color: var(--lumo-primary-text-color, #1676f3); background: var(--lumo-primary-color-10pct, rgba(22, 118, 243, .1));">
                ${glyph()}
            </span>
            <h2 class="mateu-not-found-title"
                style="margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); font-weight: 600; line-height: var(--lumo-line-height-s, 1.375);
                       color: var(--lumo-header-text-color, var(--lumo-body-text-color, #1a2533)); overflow-wrap: anywhere;">${title}</h2>
            <p class="mateu-not-found-message" style="margin: 0; max-width: 32rem; font-size: var(--lumo-font-size-m, 1rem);">${message}</p>
            ${backRoute ? html`
                <a class="mateu-not-found-back" href="${ifDefined(safeHref(backRoute))}" @click="${(e: Event) => goBack(e, backRoute)}"
                   style="margin-top: var(--lumo-space-m, 1rem); font-weight: 500; text-decoration: none;
                          color: var(--lumo-primary-text-color, #1676f3);">← ${metadata.backLabel || chromeText('goBack')}</a>
            ` : nothing}
        </section>
    `
}
