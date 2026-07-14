import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { renderButton } from "@/renderers/renderButton.ts";
import { renderField } from "@/renderers/renderField.ts";
import { renderApp } from "@/renderers/renderApp.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { renderForm } from "@/renderers/renderForm.ts";
import { renderPage } from "@/renderers/renderPage.ts";
import {
    renderFormLayout, renderFormRow, renderFormSection, renderFormSubSection,
    renderHorizontalLayout, renderVerticalLayout, renderSplitLayout, renderCard,
    renderText, renderBadge, renderAnchor, renderDialog, renderConfirmDialog,
    renderScroller, renderFullWidth, renderContainer,
    renderBoardLayout, renderBoardLayoutRow, renderBoardLayoutItem,
    renderMasterDetailLayout, renderCarouselLayout,
} from "@/renderers/renderLayouts.ts";
import {
    renderIcon, renderBreadcrumbs, renderNotification, renderProgressBar,
    renderDetails, renderAvatar, renderAvatarGroup, renderTooltip,
    renderPopover, renderMenuBar, renderContextMenu,
} from "@/renderers/renderDisplayComponents.ts";
import {
    renderGrid, renderTable, renderVirtualList, renderDirectory,
    renderCustomField, renderMessageList, renderMessageInput,
} from "@/renderers/renderData.ts";
import './components/mateu-redwood-tabs'
import './components/mateu-redwood-accordion'
import { MateuTableCrud } from "@infra/ui/mateu-table-crud.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";
import './components/mateu-redwood-table'
import './components/mateu-redwood-pagination'
import './components/mateu-redwood-action-menu'

// Local UI state of the smart-search filter bar, keyed by the crud element: the renderer hook is
// stateless, so panel-open/active-filter/uncommitted-text live here and re-renders go through the
// host's requestUpdate(). The document-level outside-click listener is stored so it can be
// detached when the panel closes (closing always detaches, so a killed crud can't leak it past
// the next click).
type SmartSearchUi = {
    open: boolean
    text: string
    activeFilter?: any
    outsideClick?: (e: Event) => void
}
const smartSearchUi = new WeakMap<HTMLElement, SmartSearchUi>()

export const changed = (event: Event, fieldId: string) => {
    const element = event.target as HTMLInputElement
    event.target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.value,
            fieldId
        },
        bubbles: true,
        composed: true
    }))
}

export const handleButtonClick = (event: Event) => {
    const actionId = (event.target as HTMLElement).dataset.actionId
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId,
        },
        bubbles: true,
        composed: true
    }))
}

/**
 * Types this renderer supports: everything handled by its own switch below (App is handled via
 * renderAppComponent, reached through the shared mateu-app infra), plus types it deliberately
 * delegates to the shared, design-system-agnostic infra (Element/Div/Image/MicroFrontend
 * markup; Crud → mateu-table-crud, which calls back into this renderer's table/filter-bar/
 * pagination; Chart/Bpmn render canvas/SVG; mateu-map renders an OpenLayers canvas;
 * mateu-markdown renders plain HTML typography; CookieConsent renders plain markup; and, since
 * parity phase 2, the Chat side panel and the Workflow/WorkflowElk/FormEditor SVG editors use
 * neutral plain-HTML chrome — no Vaadin components left in any of them).
 *
 * Anything else renders a visible <mateu-unsupported> placeholder instead of silently falling
 * back to Vaadin-flavoured components (parity phase 0). This set currently covers the full
 * shared switch (renderClientSideComponent.ts).
 */
const SUPPORTED_TYPES: ReadonlySet<ComponentMetadataType> = new Set([
    // own switch (+ App via renderAppComponent)
    ComponentMetadataType.App,
    ComponentMetadataType.Page,
    ComponentMetadataType.Form,
    ComponentMetadataType.Button,
    ComponentMetadataType.FormField,
    ComponentMetadataType.FormLayout,
    ComponentMetadataType.FormRow,
    ComponentMetadataType.FormSection,
    ComponentMetadataType.FormSubSection,
    ComponentMetadataType.HorizontalLayout,
    ComponentMetadataType.VerticalLayout,
    ComponentMetadataType.SplitLayout,
    ComponentMetadataType.MasterDetailLayout,
    ComponentMetadataType.Scroller,
    ComponentMetadataType.FullWidth,
    ComponentMetadataType.Container,
    ComponentMetadataType.BoardLayout,
    ComponentMetadataType.BoardLayoutRow,
    ComponentMetadataType.BoardLayoutItem,
    ComponentMetadataType.CarouselLayout,
    ComponentMetadataType.Card,
    ComponentMetadataType.Text,
    ComponentMetadataType.Badge,
    ComponentMetadataType.Anchor,
    ComponentMetadataType.Icon,
    ComponentMetadataType.Breadcrumbs,
    ComponentMetadataType.Notification,
    ComponentMetadataType.ProgressBar,
    ComponentMetadataType.Details,
    ComponentMetadataType.Avatar,
    ComponentMetadataType.AvatarGroup,
    ComponentMetadataType.Tooltip,
    ComponentMetadataType.Popover,
    ComponentMetadataType.MenuBar,
    ComponentMetadataType.ContextMenu,
    ComponentMetadataType.TabLayout,
    ComponentMetadataType.AccordionLayout,
    ComponentMetadataType.Dialog,
    ComponentMetadataType.Drawer,
    ComponentMetadataType.ConfirmDialog,
    ComponentMetadataType.Grid,
    ComponentMetadataType.Table,
    ComponentMetadataType.VirtualList,
    ComponentMetadataType.Directory,
    ComponentMetadataType.CustomField,
    ComponentMetadataType.MessageList,
    ComponentMetadataType.MessageInput,
    // deliberate delegation to shared, design-system-agnostic infra
    ComponentMetadataType.Crud,
    ComponentMetadataType.Element,
    ComponentMetadataType.Div,
    ComponentMetadataType.Image,
    ComponentMetadataType.MicroFrontend,
    ComponentMetadataType.Markdown,
    ComponentMetadataType.Chart,
    ComponentMetadataType.Bpmn,
    ComponentMetadataType.Map,
    ComponentMetadataType.Chat,
    ComponentMetadataType.CookieConsent,
    ComponentMetadataType.Workflow,
    ComponentMetadataType.WorkflowElk,
    ComponentMetadataType.FormEditor,
    ComponentMetadataType.MetricCard,
    ComponentMetadataType.Scoreboard,
    ComponentMetadataType.DashboardPanel,
    ComponentMetadataType.DashboardLayout,
    ComponentMetadataType.FoldoutLayout,
    ComponentMetadataType.HeroSection,
    ComponentMetadataType.EmptyState,
    ComponentMetadataType.Skeleton,
    ComponentMetadataType.Gantt,
    ComponentMetadataType.Kanban,
    ComponentMetadataType.Timeline,
    ComponentMetadataType.ProgressSteps,
    ComponentMetadataType.Stat,
    ComponentMetadataType.Calendar,
    ComponentMetadataType.PricingTable,
    ComponentMetadataType.OrgChart,
    ComponentMetadataType.Heatmap,
    ComponentMetadataType.Funnel,
    ComponentMetadataType.TrendChart,
    ComponentMetadataType.FeatureGrid,
    ComponentMetadataType.Testimonials,
    ComponentMetadataType.Faq,
    ComponentMetadataType.CalloutCard,
    ComponentMetadataType.CommentThread,
    ComponentMetadataType.FileList,
])

export class RedwoodOjComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    rendererName(): string {
        return 'redwood-oj'
    }

    supportedClientSideTypes(): ReadonlySet<ComponentMetadataType> {
        return SUPPORTED_TYPES
    }

    // mateu-table-crud delegates ALL crud grid layouts (table/list/cards/masterDetail/tree) to
    // renderTableComponent, so mateu-redwood-table renders them with Redwood-styled markup
    // instead of the shared Vaadin-flavoured templates.
    rendersCrudLayouts(): boolean {
        return true
    }

    // Smart-search filter bar, after the Redwood Smart Search pattern (oj-sp/smart-search, which
    // is Fusion-only and not on npm): ONE search field hosting both the free-text keyword search
    // and the structured filters. Focusing the field opens a panel listing the available filters
    // (each with a type-specific widget: option list for selects, Yes/No for booleans, an input
    // for text/number); every applied condition becomes a chip in the bar with its own ✕.
    // Everything is hand-styled divs for the same reason as renderToolbarButton below.
    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        const metadata = component?.metadata as Crud
        const filters = (metadata?.filters ?? []) as any[]
        const ui = smartSearchUi.get(container) ?? { open: false, text: '' }
        smartSearchUi.set(container, ui)
        const rerender = () => container.requestUpdate()

        const detachOutsideClick = () => {
            if (ui.outsideClick) {
                document.removeEventListener('mousedown', ui.outsideClick)
                ui.outsideClick = undefined
            }
        }
        const closePanel = () => {
            detachOutsideClick()
            ui.open = false
            ui.activeFilter = undefined
            rerender()
        }
        const openPanel = () => {
            if (ui.open) return
            ui.open = true
            ui.outsideClick = (e: Event) => {
                const inside = e.composedPath().some(el =>
                    el instanceof HTMLElement && el.classList?.contains('mateu-smart-search'))
                if (!inside) closePanel()
            }
            document.addEventListener('mousedown', ui.outsideClick)
            rerender()
        }
        const doSearch = () => {
            detachOutsideClick()
            ui.open = false
            ui.activeFilter = undefined
            container.search()
        }
        const applyFilter = (fieldId: string, value: unknown) => {
            state[fieldId] = value
            doSearch()
        }
        const removeChip = (fieldId: string) => {
            const field = filters.find(f => f.fieldId === fieldId)
            if (field && isRangeFilter(field)) {
                // a range condition lives in two state keys — the chip clears both
                state[`${fieldId}_from`] = undefined
                state[`${fieldId}_to`] = undefined
            } else {
                state[fieldId] = fieldId === 'searchText' ? '' : undefined
            }
            doSearch()
        }
        const commitText = (input: HTMLInputElement) => {
            state['searchText'] = input.value
            ui.text = ''
            input.value = ''
            doSearch()
        }

        // the Java server emits dataType 'bool', the .NET one 'boolean' — accept both
        const isBooleanFilter = (f: any) => f.dataType === 'boolean' || f.dataType === 'bool' || f.stereotype === 'checkbox' || f.stereotype === 'toggle'
        const isNumericFilter = (f: any) => ['integer', 'decimal', 'number', 'money'].includes(f.dataType)
        const isRangeFilter = (f: any) => f.stereotype === 'dateRange' || f.stereotype === 'numberRange'
        const isMultiFilter = (f: any) => f.stereotype === 'multiSelect'
        const hasOptions = (f: any) => (f.options?.length ?? 0) > 0
        // multi-select values are an array on a live client and a comma-joined string after a
        // URL restore — normalize both
        const multiValues = (f: any): string[] => {
            const value = state[f.fieldId]
            if (Array.isArray(value)) return value.map(String)
            if (typeof value === 'string' && value !== '') return value.split(',').map(v => v.trim()).filter(v => v)
            return []
        }
        const rangeBound = (f: any, bound: 'from' | 'to'): string => {
            const value = state[`${f.fieldId}_${bound}`]
            return value === undefined || value === null ? '' : String(value)
        }
        const isSet = (f: any): boolean => {
            if (isRangeFilter(f)) return rangeBound(f, 'from') !== '' || rangeBound(f, 'to') !== ''
            if (isMultiFilter(f)) return multiValues(f).length > 0
            const value = state[f.fieldId]
            return value !== undefined && value !== null && value !== ''
        }
        const displayValue = (f: any, value: unknown): string => {
            const option = f?.options?.find((o: any) => o.value === String(value))
            if (option) return option.label ?? option.value
            if (typeof value === 'boolean') return value ? 'Yes' : 'No'
            return String(value)
        }
        const conditionDisplay = (f: any): string => {
            if (isRangeFilter(f)) {
                const from = rangeBound(f, 'from')
                const to = rangeBound(f, 'to')
                if (from && to) return `${from} – ${to}`
                return from ? `≥ ${from}` : `≤ ${to}`
            }
            if (isMultiFilter(f)) return multiValues(f).map(v => displayValue(f, v)).join(', ')
            return displayValue(f, state[f.fieldId])
        }

        const chips: { fieldId: string, label: string, display: string }[] = []
        if (state.searchText) chips.push({ fieldId: 'searchText', label: 'Text', display: String(state.searchText) })
        filters.forEach(f => {
            if (isSet(f)) {
                chips.push({ fieldId: f.fieldId, label: f.label || f.fieldId, display: conditionDisplay(f) })
            }
        })

        const TEXT = 'var(--mateu-redwood-text, rgb(22, 21, 19))'
        const ROW_STYLE = `display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.75rem; cursor: pointer; color: ${TEXT}; font-size: 0.875rem;`
        // panel rows preventDefault on mousedown so the search input keeps focus (and the
        // document-level outside-click handler never sees a click that would close the panel)
        const keepFocus = (e: Event) => e.preventDefault()

        const panelRow = (label: unknown, onPick: () => void, bold = false) => html`
            <div style="${ROW_STYLE} ${bold ? 'font-weight: 600;' : ''}"
                 @mousedown="${keepFocus}"
                 @click="${onPick}"
                 onmouseover="this.style.background='rgba(22,21,19,0.06)'"
                 onmouseout="this.style.background='transparent'">${label}</div>`

        const INPUT_STYLE = `flex: 1; min-width: 0; font: inherit; font-size: 0.875rem; color: ${TEXT}; border: 1px solid rgba(22,21,19,0.5); border-radius: 4px; padding: 0.35rem 0.5rem; outline: none;`
        const APPLY_STYLE = 'font: inherit; font-size: 0.875rem; background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent; border-radius: 4px; padding: 0.35rem 0.75rem; cursor: pointer;'

        // two bound inputs; Apply (or Enter) commits both ends to <fieldId>_from/_to and searches
        const rangeWidget = (f: any) => {
            const inputType = f.stereotype === 'numberRange'
                ? 'number'
                : f.dataType === 'dateTime' ? 'datetime-local'
                : f.dataType === 'time' ? 'time'
                : 'date'
            const apply = (origin: HTMLElement) => {
                const row = origin.closest('.range-row') as HTMLElement
                state[`${f.fieldId}_from`] = (row.querySelector('input.range-from') as HTMLInputElement).value || undefined
                state[`${f.fieldId}_to`] = (row.querySelector('input.range-to') as HTMLInputElement).value || undefined
                doSearch()
            }
            const onKeydown = (e: KeyboardEvent) => {
                if (e.key === 'Enter') apply(e.target as HTMLElement)
                if (e.key === 'Escape') closePanel()
            }
            return html`
                <div class="range-row" style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem 0.75rem;">
                    <input class="range-from" type="${inputType}" placeholder="From" style="${INPUT_STYLE}"
                           .value="${rangeBound(f, 'from')}"
                           @mousedown="${(e: Event) => e.stopPropagation()}"
                           @keydown="${onKeydown}"/>
                    <span aria-hidden="true" style="color: rgba(22,21,19,0.55);">–</span>
                    <input class="range-to" type="${inputType}" placeholder="To" style="${INPUT_STYLE}"
                           .value="${rangeBound(f, 'to')}"
                           @mousedown="${(e: Event) => e.stopPropagation()}"
                           @keydown="${onKeydown}"/>
                    <button style="${APPLY_STYLE}"
                            @mousedown="${keepFocus}"
                            @click="${(e: Event) => apply(e.target as HTMLElement)}">Apply</button>
                </div>`
        }

        // checkable option rows; every toggle re-runs the search but keeps the panel open
        const multiWidget = (f: any) => {
            const selected = multiValues(f)
            const toggle = (value: string) => {
                const next = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]
                state[f.fieldId] = next.length > 0 ? next : undefined
                container.search()
                rerender()
            }
            const CHECK = 'display: inline-flex; align-items: center; justify-content: center; width: 1rem; height: 1rem; border-radius: 3px; font-size: 0.7rem; line-height: 1; flex: none;'
            return html`${(f.options ?? []).map((o: any) => panelRow(html`
                <span aria-hidden="true" style="${CHECK} ${selected.includes(o.value)
                    ? 'background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); border: 1px solid transparent; color: #fff;'
                    : 'border: 1px solid rgba(22,21,19,0.5);'}">${selected.includes(o.value) ? '✓' : ''}</span>
                ${o.label ?? o.value}
            `, () => toggle(o.value)))}`
        }

        const activeFilterWidget = (f: any) => {
            if (isRangeFilter(f)) {
                return rangeWidget(f)
            }
            if (isMultiFilter(f)) {
                return multiWidget(f)
            }
            if (hasOptions(f)) {
                return html`${f.options.map((o: any) => panelRow(o.label ?? o.value, () => applyFilter(f.fieldId, o.value)))}`
            }
            if (isBooleanFilter(f)) {
                return html`
                    ${panelRow('Yes', () => applyFilter(f.fieldId, true))}
                    ${panelRow('No', () => applyFilter(f.fieldId, false))}`
            }
            const numeric = isNumericFilter(f)
            const apply = (input: HTMLInputElement) => {
                if (input.value === '') return
                applyFilter(f.fieldId, numeric ? Number(input.value) : input.value)
            }
            return html`
                <div style="display: flex; gap: 0.5rem; padding: 0.5rem 0.75rem;">
                    <input type="${numeric ? 'number' : 'text'}"
                           placeholder="${f.placeholder || f.label || f.fieldId}"
                           style="flex: 1; font: inherit; font-size: 0.875rem; color: ${TEXT}; border: 1px solid rgba(22,21,19,0.5); border-radius: 4px; padding: 0.35rem 0.5rem; outline: none;"
                           @mousedown="${(e: Event) => e.stopPropagation()}"
                           @keydown="${(e: KeyboardEvent) => {
                               if (e.key === 'Enter') apply(e.target as HTMLInputElement)
                               if (e.key === 'Escape') closePanel()
                           }}"/>
                    <button style="font: inherit; font-size: 0.875rem; background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent; border-radius: 4px; padding: 0.35rem 0.75rem; cursor: pointer;"
                            @mousedown="${keepFocus}"
                            @click="${(e: Event) => apply((e.target as HTMLElement).previousElementSibling as HTMLInputElement)}">Apply</button>
                </div>`
        }

        const panel = ui.open && filters.length > 0 ? html`
            <div style="position: absolute; top: calc(100% + 4px); left: 0; min-width: 20rem; max-width: 100%; background: var(--mateu-redwood-panel-bg, #fff); border: 1px solid rgba(22,21,19,0.25); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); z-index: 30; overflow: hidden; padding: 0.25rem 0;">
                ${ui.activeFilter ? html`
                    <div style="${ROW_STYLE} font-weight: 600; border-bottom: 1px solid rgba(22,21,19,0.15);"
                         @mousedown="${keepFocus}"
                         @click="${() => { ui.activeFilter = undefined; rerender() }}">
                        <span aria-hidden="true">←</span> ${ui.activeFilter.label || ui.activeFilter.fieldId}
                    </div>
                    ${activeFilterWidget(ui.activeFilter)}
                ` : html`
                    <div style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(22,21,19,0.6);">Filter by</div>
                    ${filters.map(f => panelRow(html`
                        ${f.label || f.fieldId}
                        ${isSet(f)
                            ? html`<span style="margin-left: auto; color: rgba(22,21,19,0.55); font-size: 0.8125rem;">${conditionDisplay(f)}</span>`
                            : nothing}
                    `, () => { ui.activeFilter = f; rerender() }))}
                `}
            </div>` : nothing

        return html`
            <div class="mateu-smart-search" style="position: relative; padding: 0.25rem 0;">
                <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; border: 1px solid rgba(22,21,19,0.5); border-radius: 8px; padding: 0.3rem 0.6rem; background: var(--mateu-redwood-panel-bg, #fff); cursor: text;"
                     @click="${(e: Event) => {
                         const bar = e.currentTarget as HTMLElement
                         ;(bar.querySelector('input.smart-search-input') as HTMLInputElement)?.focus()
                         openPanel()
                     }}">
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" style="flex: none; opacity: 0.6;">
                        <path fill="${TEXT.startsWith('var') ? 'rgb(22,21,19)' : TEXT}" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${chips.map(chip => html`
                        <span style="display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(22,21,19,0.08); border-radius: 1rem; padding: 0.15rem 0.3rem 0.15rem 0.6rem; font-size: 0.8125rem; color: ${TEXT}; white-space: nowrap;">
                            <span style="opacity: 0.7;">${chip.label}:</span> ${chip.display}
                            <button aria-label="Remove filter ${chip.label}"
                                    style="border: none; background: transparent; cursor: pointer; font-size: 0.75rem; line-height: 1; padding: 0.1rem 0.3rem; opacity: 0.6;"
                                    @mousedown="${keepFocus}"
                                    @click="${(e: Event) => { e.stopPropagation(); removeChip(chip.fieldId) }}">✕</button>
                        </span>`)}
                    ${metadata?.searchable !== false ? html`
                        <input class="smart-search-input" type="text"
                               placeholder="${chips.length === 0 ? 'Search' : ''}"
                               .value="${ui.text ?? ''}"
                               style="flex: 1 1 8rem; min-width: 7rem; border: none; outline: none; background: transparent; font: inherit; font-size: 0.875rem; color: ${TEXT}; padding: 0.25rem 0;"
                               @input="${(e: Event) => {
                                   ui.text = (e.target as HTMLInputElement).value
                                   // open on typing (and on the bar click) rather than on focus:
                                   // autoFocusOnSearchText would pop the panel on page load
                                   openPanel()
                               }}"
                               @keydown="${(e: KeyboardEvent) => {
                                   if (e.key === 'Enter') commitText(e.target as HTMLInputElement)
                                   if (e.key === 'Escape') closePanel()
                               }}"/>
                    ` : nothing}
                </div>
                ${panel}
                ${metadata?.header?.map(comp => renderComponent(container, comp, baseUrl, state, data, appState, appData))}
            </div>
        `
    }

    // Rendered as a hand-styled plain <button> with the Redwood look (values measured from real
    // oj-c-buttons, themed through the --oj-* vars which DO inherit across shadow roots) instead
    // of an <oj-c-button>: this template also renders inside the shadow roots of the shared
    // mateu-content-header / mateu-page, where JET's document-level CSS-module stylesheets can't
    // reach, so a real oj-c-button mounts unstyled there.
    renderToolbarButton(button: unknown, label: string, onClick: () => void): TemplateResult {
        const btn = button as Button
        const kind =
            btn.color === 'error' || (btn as any).variant === 'error' || (btn as any).variant === 'danger' ? 'danger'
            : btn.buttonStyle === 'primary' ? 'callToAction'
            : 'outlined'
        const skin = kind === 'danger'
            ? 'background: var(--mateu-redwood-danger-bg, rgb(179, 49, 31)); color: #fff; border: 1px solid transparent;'
            : kind === 'callToAction'
            ? 'background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent;'
            : 'background: transparent; color: var(--mateu-redwood-text, rgb(22, 21, 19)); border: 1px solid rgba(22, 21, 19, 0.5);'
        return html`
            <button
                data-action-id="${btn.id}"
                style="${skin} border-radius: 4px; height: 40px; padding: 0 16px; font-family: 'Oracle Sans', -apple-system, system-ui, sans-serif; font-size: 0.86rem; font-weight: 600; cursor: pointer; ${btn.disabled ? 'opacity: .4; pointer-events: none;' : ''}"
                ?disabled="${btn.disabled}"
                @click="${onClick}"
            >${label}</button>
        `
    }

    renderPagination(container: MateuTableCrud, _component: ClientSideComponent | undefined): TemplateResult {
        const id = container.id
        return html`
            <mateu-redwood-pagination
                data-oj-binding-provider="preact"
                @page-changed="${container.pageChanged}"
                @fetch-more-elements="${container.fetchMoreElements}"
                totalElements="${(container.data[id]?.page?.totalElements) ?? 0}"
                pageSize="${(container.data[id]?.page?.pageSize) ?? 100}"
                pageNumber="${(container.data[id]?.page?.pageNumber) ?? 0}"
            ></mateu-redwood-pagination>
        `
    }

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, _data: any, appState: any, appData: any): TemplateResult {
        return html`
        <mateu-redwood-table id="${container.id}"
                     .metadata="${component?.metadata}"
                     .data="${container.data}"
                     .emptyStateMessage="${state[component?.id!]?.emptyStateMessage}"
                     @sort-direction-changed="${container.directionChanged}"
                     @fetch-more-elements="${container.fetchMoreElements}"
                     .state="${state}"
                     .appState="${appState}"
                     .appData="${appData}"
                     baseUrl="${baseUrl}"
        ></mateu-redwood-table>
        `
    }

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
        if (ComponentMetadataType.Page == component?.metadata?.type) {
            return renderPage(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Form == component?.metadata?.type) {
            return renderForm(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Button == component?.metadata?.type) {
            return renderButton(component, baseUrl, state, data)
        }
        if (ComponentMetadataType.FormField == component?.metadata?.type) {
            return renderField(container, component, baseUrl, state, data)
        }
        if (ComponentMetadataType.FormLayout == component?.metadata?.type) {
            return renderFormLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormRow == component?.metadata?.type) {
            return renderFormRow(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormSection == component?.metadata?.type) {
            return renderFormSection(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormSubSection == component?.metadata?.type) {
            return renderFormSubSection(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.HorizontalLayout == component?.metadata?.type) {
            return renderHorizontalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.VerticalLayout == component?.metadata?.type) {
            return renderVerticalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.SplitLayout == component?.metadata?.type) {
            return renderSplitLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.MasterDetailLayout == component?.metadata?.type) {
            return renderMasterDetailLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Scroller == component?.metadata?.type) {
            return renderScroller(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FullWidth == component?.metadata?.type) {
            return renderFullWidth(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Container == component?.metadata?.type) {
            return renderContainer(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayout == component?.metadata?.type) {
            return renderBoardLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayoutRow == component?.metadata?.type) {
            return renderBoardLayoutRow(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayoutItem == component?.metadata?.type) {
            return renderBoardLayoutItem(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.CarouselLayout == component?.metadata?.type) {
            return renderCarouselLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Card == component?.metadata?.type) {
            return renderCard(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Text == component?.metadata?.type) {
            return renderText(container, component)
        }
        if (ComponentMetadataType.Badge == component?.metadata?.type) {
            return renderBadge(component)
        }
        if (ComponentMetadataType.Anchor == component?.metadata?.type) {
            return renderAnchor(component)
        }
        if (ComponentMetadataType.Icon == component?.metadata?.type) {
            return renderIcon(component)
        }
        if (ComponentMetadataType.Breadcrumbs == component?.metadata?.type) {
            return renderBreadcrumbs(component)
        }
        if (ComponentMetadataType.Notification == component?.metadata?.type) {
            return renderNotification(component)
        }
        if (ComponentMetadataType.ProgressBar == component?.metadata?.type) {
            return renderProgressBar(component, state)
        }
        if (ComponentMetadataType.Details == component?.metadata?.type) {
            return renderDetails(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Avatar == component?.metadata?.type) {
            return renderAvatar(component, state, data)
        }
        if (ComponentMetadataType.AvatarGroup == component?.metadata?.type) {
            return renderAvatarGroup(component)
        }
        if (ComponentMetadataType.Tooltip == component?.metadata?.type) {
            return renderTooltip(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Popover == component?.metadata?.type) {
            return renderPopover(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.MenuBar == component?.metadata?.type) {
            return renderMenuBar(container, component)
        }
        if (ComponentMetadataType.ContextMenu == component?.metadata?.type) {
            return renderContextMenu(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Grid == component?.metadata?.type) {
            return renderGrid(component, state)
        }
        if (ComponentMetadataType.Table == component?.metadata?.type) {
            return renderTable(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.VirtualList == component?.metadata?.type) {
            return renderVirtualList(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Directory == component?.metadata?.type) {
            return renderDirectory(component)
        }
        if (ComponentMetadataType.CustomField == component?.metadata?.type) {
            return renderCustomField(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.MessageList == component?.metadata?.type) {
            return renderMessageList(component)
        }
        if (ComponentMetadataType.MessageInput == component?.metadata?.type) {
            return renderMessageInput(component)
        }
        if (ComponentMetadataType.TabLayout == component?.metadata?.type) {
            return html`<mateu-redwood-tabs
                    .component="${component}" .container="${container}" baseUrl="${baseUrl}"
                    .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"
            ></mateu-redwood-tabs>`
        }
        if (ComponentMetadataType.AccordionLayout == component?.metadata?.type) {
            return html`<mateu-redwood-accordion
                    .component="${component}" .container="${container}" baseUrl="${baseUrl}"
                    .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"
            ></mateu-redwood-accordion>`
        }
        if (ComponentMetadataType.Dialog == component?.metadata?.type) {
            return renderDialog(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.ConfirmDialog == component?.metadata?.type) {
            return renderConfirmDialog(container, component, baseUrl, state, data, appState, appData)
        }
        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        return renderApp(container, component!, baseUrl, state, data, appState, appData)
    }
}
