import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts"
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts"

const evalTpl = (raw: string | undefined, container: LitElement): string => {
    if (!raw) return ''
    return raw.includes('${') && (container as any)._evalTemplate ? (container as any)._evalTemplate(raw) : raw
}

const kids = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any) =>
    (component.children ?? []).map((c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData))

// FormLayout nests FormRow > FormItem > field (a Vaadin artifact); flatten to leaves.
const flatten = (comp: any): any[] => {
    const t = comp?.metadata?.type
    if (t === 'FormRow' || t === 'FormItem') return (comp.children ?? []).flatMap(flatten)
    return [comp]
}

export const renderFormLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const cols = Math.max(1, md.maxColumns ?? 1)
    const leaves = (component.children ?? []).flatMap(flatten)
    // Cells honor each field's colspan (clamped to the grid width) and clip their overflow —
    // otherwise a dense (@Compact) section with nowrap labels bleeds over its neighbours.
    const span = (c: any): number => {
        const raw = c?.metadata?.colspan
        const n = typeof raw === 'number' ? raw : parseInt(raw ?? '1', 10)
        return Math.min(Math.max(isNaN(n) ? 1 : n, 1), cols)
    }
    return html`
        <div style="display:grid; grid-template-columns: repeat(${cols}, minmax(0,1fr)); gap:.5rem 1.5rem; align-items:start;">
            ${leaves.map((c: any) => html`<div style="grid-column: span ${span(c)}; min-width:0; overflow:hidden;">${renderComponent(container, c, baseUrl, state, data, appState, appData)}</div>`)}
        </div>`
}

export const renderFormRow = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult =>
    html`<div style="display:flex; flex-direction:row; gap:1rem; flex-wrap:wrap;">${kids(container, component, baseUrl, state, data, appState, appData)}</div>`

export const renderFormSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const title = evalTpl((component.metadata as any).title, container)
    return html`
        <div class="oj-panel oj-panel-shadow-sm" style="padding:1rem; margin-bottom:1rem; border-radius:var(--oj-core-border-radius-lg, .375rem);"
             slot="${component.slot ?? nothing}">
            ${title ? html`<h2 class="oj-typography-heading-sm" style="margin:0 0 .75rem;">${title}</h2>` : nothing}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${kids(container, component, baseUrl, state, data, appState, appData)}
            </div>
        </div>`
}

export const renderFormSubSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const title = evalTpl((component.metadata as any).title, container)
    return html`
        <div style="margin:.5rem 0;" slot="${component.slot ?? nothing}">
            ${title ? html`<h3 class="oj-typography-subheading-sm" style="margin:0 0 .5rem;">${title}</h3>` : nothing}
            <div style="display:flex; flex-direction:column; gap:.5rem;">${kids(container, component, baseUrl, state, data, appState, appData)}</div>
        </div>`
}

export const renderHorizontalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const gap = md?.spacing === false ? '0' : '1rem'
    return html`<div style="display:flex; flex-direction:row; gap:${gap}; ${md?.wrap ? 'flex-wrap:wrap;' : ''} ${md?.fullWidth ? 'width:100%;' : ''} ${component.style ?? ''}"
                     slot="${component.slot ?? nothing}">${kids(container, component, baseUrl, state, data, appState, appData)}</div>`
}

export const renderVerticalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const gap = md?.spacing === false ? '0' : '.75rem'
    return html`<div style="display:flex; flex-direction:column; gap:${gap}; ${md?.fullWidth ? 'width:100%;' : ''} ${component.style ?? ''}"
                     slot="${component.slot ?? nothing}">${kids(container, component, baseUrl, state, data, appState, appData)}</div>`
}

export const renderSplitLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const dir = (component.metadata as any)?.orientation === 'vertical' ? 'column' : 'row'
    return html`<div style="display:flex; flex-direction:${dir}; gap:1rem; width:100%; ${component.style ?? ''}" slot="${component.slot ?? nothing}">
        ${(component.children ?? []).map((c: any) => html`<div style="flex:1; min-width:0;">${renderComponent(container, c, baseUrl, state, data, appState, appData)}</div>`)}
    </div>`
}

export const renderCard = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    const titleText = typeof md.title === 'string' ? md.title : ''
    // Form sections (the backend marks their cards with the mateu-section class) follow the
    // Redwood form convention: a flat section — heading with a divider, content on the page
    // background — instead of an elevated panel.
    if (component.cssClasses?.includes('mateu-section')) {
        const heading = titleText
            ? html`<h2 class="oj-typography-heading-sm" style="margin: 0;">${titleText}</h2>`
            : (typeof md.title === 'object' && md.title ? render(md.title) : nothing)
        // min-width/overflow keep dense sections (wide title-row toolbars, @Compact grids) from
        // bleeding over the neighbouring @Zones column — the overflow scrolls locally instead.
        return html`
            <section class="${component.cssClasses}" style="margin: 0 0 1.5rem 0; min-width: 0; overflow-x: auto; ${component.style ?? ''}"
                 slot="${component.slot ?? nothing}">
                ${heading !== nothing ? html`
                    <div style="padding-bottom: .5rem; border-bottom: 1px solid var(--oj-core-divider-color, rgba(22, 21, 19, 0.2));">${heading}</div>
                ` : nothing}
                <div style="padding-top: .75rem;">
                    ${render(md.content)}
                    ${kids(container, component, baseUrl, state, data, appState, appData)}
                    ${render(md.footer)}
                </div>
            </section>`
    }
    return html`
        <div class="oj-panel oj-panel-shadow-sm" style="border-radius:var(--oj-core-border-radius-lg, .375rem); overflow:hidden;"
             slot="${component.slot ?? nothing}">
            ${titleText ? html`<h2 class="oj-typography-heading-sm" style="margin:0; padding:.75rem 1rem; border-bottom:1px solid var(--oj-core-divider-color, rgba(22,21,19,.12));">${titleText}</h2>` : nothing}
            <div style="padding:1rem;">
                ${typeof md.title === 'object' ? render(md.title) : nothing}
                ${render(md.content)}
                ${kids(container, component, baseUrl, state, data, appState, appData)}
                ${render(md.footer)}
            </div>
        </div>`
}

// ── Display ─────────────────────────────────────────────────────────────────────

const textClass = (container: string | undefined): string => {
    switch (container) {
        case 'h1': return 'oj-typography-heading-xl'
        case 'h2': return 'oj-typography-heading-lg'
        case 'h3': return 'oj-typography-heading-md'
        case 'h4': return 'oj-typography-heading-sm'
        case 'h5':
        case 'h6': return 'oj-typography-subheading-sm'
        default: return 'oj-typography-body-md'
    }
}

export const renderText = (container: LitElement, component: ClientSideComponent, _state?: any): TemplateResult => {
    const md = component.metadata as any
    const text = evalTpl(md.text, container)
    return html`<div class="${textClass(md.container)}" style="${component.style ?? ''}">${text}</div>`
}

export const renderBadge = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    const color = md.color as string
    const variant = color === 'success' ? 'success' : color === 'error' || color === 'danger' ? 'danger'
        : color === 'warning' ? 'warning' : color === 'info' ? 'info' : 'neutral'
    return html`<oj-c-badge variant="${variant}" slot="${component.slot ?? nothing}">${md.text ?? ''}</oj-c-badge>`
}

export const renderAnchor = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    return html`<a class="oj-link-standalone" href="${md.url ?? '#'}" slot="${component.slot ?? nothing}">${md.text ?? md.url ?? ''}</a>`
}

// ── Dialog / ConfirmDialog (modal overlay, Redwood styling) ─────────────────────

const dispatchAction = (el: EventTarget | null, actionId: string | undefined) => {
    if (!actionId) return
    el?.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters: {} }, bubbles: true, composed: true,
    }))
}

const modalShell = (title: string, body: unknown, footer: unknown): TemplateResult => html`
    <div style="position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000;">
        <div class="oj-panel oj-panel-shadow-lg" role="dialog" aria-modal="true"
             style="background:var(--oj-core-bg-color-content, #fff); border-radius:var(--oj-core-border-radius-lg, .375rem); min-width:320px; max-width:90vw; max-height:90vh; overflow:auto;">
            ${title ? html`<h2 class="oj-typography-heading-sm" style="margin:0; padding:1rem; border-bottom:1px solid var(--oj-core-divider-color, rgba(22,21,19,.12));">${title}</h2>` : nothing}
            <div style="padding:1rem;">${body}</div>
            ${footer ? html`<div style="display:flex; gap:.5rem; justify-content:flex-end; padding:.75rem 1rem; border-top:1px solid var(--oj-core-divider-color, rgba(22,21,19,.12));">${footer}</div>` : nothing}
        </div>
    </div>`

export const renderDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const title = evalTpl(md.headerTitle, container)
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    const body = html`${render(md.content)}${kids(container, component, baseUrl, state, data, appState, appData)}`
    return modalShell(title, body, render(md.footer))
}

export const renderConfirmDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const title = evalTpl(md.header, container)
    const body = md.content ? renderComponent(container, md.content, baseUrl, state, data, appState, appData) : nothing
    const footer = html`
        ${md.canCancel ? html`<oj-c-button label="${md.cancelText ?? 'Cancel'}" @ojAction="${(e: Event) => dispatchAction(e.target, md.cancelActionId)}"></oj-c-button>` : nothing}
        ${md.canReject ? html`<oj-c-button label="${md.rejectText ?? 'No'}" @ojAction="${(e: Event) => dispatchAction(e.target, md.rejectActionId)}"></oj-c-button>` : nothing}
        <oj-c-button chroming="callToAction" label="${md.confirmText ?? 'OK'}" @ojAction="${(e: Event) => dispatchAction(e.target, md.confirmActionId)}"></oj-c-button>`
    return modalShell(title, body, footer)
}

// ── Auxiliary containers (parity phase 3) ───────────────────────────────────────

export const renderScroller = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult =>
    html`<div style="overflow: auto; ${component.style ?? ''}" class="${component.cssClasses ?? nothing}"
              slot="${component.slot ?? nothing}">${kids(container, component, baseUrl, state, data, appState, appData)}</div>`

export const renderFullWidth = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult =>
    html`<div style="width: 100%; ${component.style ?? ''}" class="${component.cssClasses ?? nothing}"
              slot="${component.slot ?? nothing}">${kids(container, component, baseUrl, state, data, appState, appData)}</div>`

export const renderContainer = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult =>
    html`<div style="max-width: min(100%, 1200px); margin: auto; ${component.style ?? ''}" class="${component.cssClasses ?? nothing}"
              slot="${component.slot ?? nothing}">${kids(container, component, baseUrl, state, data, appState, appData)}</div>`

export const renderBoardLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult =>
    html`<div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; ${component.style ?? ''}"
              class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
        ${kids(container, component, baseUrl, state, data, appState, appData)}</div>`

// Rows honor each BoardLayoutItem's boardCols as flex weight (vaadin-board-row's board-cols).
export const renderBoardLayoutRow = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const grow = (child: any): number =>
        child?.metadata?.type === 'BoardLayoutItem' ? (child.metadata.boardCols ?? 1) : 1
    return html`<div style="display: flex; flex-direction: row; gap: 1rem; width: 100%; ${component.style ?? ''}"
                     class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
        ${(component.children ?? []).map((child: any) => html`
            <div style="flex: ${grow(child)} 1 0; min-width: 0;">${renderComponent(container, child, baseUrl, state, data, appState, appData)}</div>`)}
    </div>`
}

export const renderBoardLayoutItem = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult =>
    html`<div style="${component.style ?? ''}" class="${component.cssClasses ?? nothing}">
        ${kids(container, component, baseUrl, state, data, appState, appData)}</div>`

// Two panes; the detail arrives in data.detailComponent / data.hasDetail (same contract as
// the shared vaadin-master-detail-layout renderer and the sapui5 port).
export const renderMasterDetailLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const staticDetail = component.children && component.children.length > 1 ? component.children[1] : null
    const dynamicDetail = data?.detailComponent ?? null
    const hasDetail = !!(data?.hasDetail) || !!staticDetail
    const detailContent = dynamicDetail ?? staticDetail
    return html`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--oj-core-divider-color, rgba(22,21,19,.12)); border-radius: var(--oj-core-border-radius-lg, .375rem); overflow: hidden; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${renderComponent(container, component.children![0], baseUrl, state, data, appState, appData)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--oj-core-divider-color, rgba(22,21,19,.12)); ${hasDetail && detailContent ? '' : 'display: flex; align-items: center; justify-content: center;'}">
                ${hasDetail && detailContent
                    ? renderComponent(container, detailContent, baseUrl, state, data, appState, appData)
                    : html`<span style="color: var(--oj-core-text-color-secondary, #666); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`
}

// Plain scroll-snap carousel with prev/next buttons: deterministic under JET's async AMD
// bootstrap (oj-c-conveyor-belt measures slotted children during its own lifecycle, which is
// fragile when Lit re-renders the slides).
export const renderCarouselLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const scroll = (dir: number) => (e: Event) => {
        const wrap = (e.target as HTMLElement).closest('.rw-carousel-wrap')
        const scroller = wrap?.querySelector(':scope > .rw-carousel') as HTMLElement | null
        scroller?.scrollBy({ left: dir * scroller.clientWidth, behavior: 'smooth' })
    }
    const showNav = md?.nav !== false
    return html`
        <div class="rw-carousel-wrap ${component.cssClasses ?? ''}" style="position: relative; width: 100%; ${component.style ?? ''}"
             slot="${component.slot ?? nothing}">
            <div class="rw-carousel" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 1rem; scrollbar-width: none;">
                ${(component.children ?? []).map((child: any) => html`
                    <div style="scroll-snap-align: start; flex: 0 0 100%; min-width: 0;">${renderComponent(container, child, baseUrl, state, data, appState, appData)}</div>`)}
            </div>
            ${showNav ? html`
                <div style="display: flex; gap: 0.5rem; justify-content: center; padding-top: 0.5rem;">
                    <oj-c-button data-oj-binding-provider="preact" label="‹" chroming="outlined" @ojAction="${scroll(-1)}"></oj-c-button>
                    <oj-c-button data-oj-binding-provider="preact" label="›" chroming="outlined" @ojAction="${scroll(1)}"></oj-c-button>
                </div>
            ` : nothing}
        </div>`
}
