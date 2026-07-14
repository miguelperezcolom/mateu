import { LitElement, html, nothing, type TemplateResult } from 'lit'
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType.ts'
import { MateuComponent } from '@infra/ui/mateu-component.ts'
import { renderApp } from '@/renderers/renderApp.ts'
import {
    renderButton, renderText, renderFormLayout, renderForm, renderFormSection, renderFormSubSection,
    renderCard, renderHorizontalLayout, renderVerticalLayout, renderSplitLayout, renderBadge,
    renderAnchor, renderDialog, renderConfirmDialog, renderPagination,
} from '@/renderers/patternfly.ts'
import { renderCrudLayout } from '@/renderers/patternflyCrud.ts'
import './components/mateu-redhat-field.ts'
import './components/mateu-redhat-tabs.ts'
import './components/mateu-redhat-accordion.ts'

/**
 * Mateu renderer for the Red Hat PatternFly 6 design system.
 *
 * PatternFly 6 is a global CSS framework (pf-v6-c-* classes), not web components, so this renderer
 * emits its own markup carrying PatternFly classes and runs in the light DOM (see index.ts
 * setUseShadowRoot(false)) so the global stylesheet reaches it. Anything not overridden falls back
 * to the shared BasicComponentRenderer.
 */
/**
 * Types this renderer supports: everything handled by its own switch below, plus types it
 * deliberately delegates to the shared infra (Page → mateu-page framing; Crud → mateu-table-crud,
 * which calls back into this renderer's table/filter-bar/pagination; Element/Div/Image/
 * MicroFrontend are design-system-agnostic). Anything else renders a visible <mateu-unsupported>
 * placeholder instead of silently falling back to Vaadin-flavoured components (parity phase 0).
 */
const SUPPORTED_TYPES: ReadonlySet<ComponentMetadataType> = new Set([
    // own switch
    ComponentMetadataType.App,
    ComponentMetadataType.Form,
    ComponentMetadataType.FormField,
    ComponentMetadataType.FormLayout,
    ComponentMetadataType.FormSection,
    ComponentMetadataType.FormSubSection,
    ComponentMetadataType.Card,
    ComponentMetadataType.Button,
    ComponentMetadataType.Text,
    ComponentMetadataType.HorizontalLayout,
    ComponentMetadataType.VerticalLayout,
    ComponentMetadataType.SplitLayout,
    ComponentMetadataType.Badge,
    ComponentMetadataType.Anchor,
    ComponentMetadataType.Dialog,
    ComponentMetadataType.Drawer,
    ComponentMetadataType.ConfirmDialog,
    ComponentMetadataType.TabLayout,
    ComponentMetadataType.AccordionLayout,
    // deliberate delegation to shared, design-system-agnostic infra
    ComponentMetadataType.Page,
    ComponentMetadataType.Crud,
    ComponentMetadataType.Element,
    ComponentMetadataType.Div,
    ComponentMetadataType.Image,
    ComponentMetadataType.MicroFrontend,
    ComponentMetadataType.Markdown,
    ComponentMetadataType.Chart,
    ComponentMetadataType.ProgressBar,
    ComponentMetadataType.CustomField,
    ComponentMetadataType.MessageList,
    ComponentMetadataType.MessageInput,
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
])

export class RedhatComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    rendererName(): string {
        return 'redhat'
    }

    supportedClientSideTypes(): ReadonlySet<ComponentMetadataType> {
        return SUPPORTED_TYPES
    }

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
        const t = component?.metadata?.type
        const c = component!

        if (ComponentMetadataType.App == t) return renderApp(container as MateuComponent, c, baseUrl, state, data)
        if (ComponentMetadataType.Form == t) return renderForm(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.FormField == t) {
            return html`<mateu-redhat-field id="${c.id}" .component="${c}" .field="${c.metadata}" .state="${state}" .data="${data}" .appState="${appState}" .appData="${appData}" .labelAlreadyRendered="${labelAlreadyRendered}"></mateu-redhat-field>`
        }
        if (ComponentMetadataType.FormLayout == t) return renderFormLayout(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.FormSection == t) return renderFormSection(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.FormSubSection == t) return renderFormSubSection(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.Card == t) return renderCard(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.Button == t) return renderButton(c, state, data)
        if (ComponentMetadataType.Text == t) return renderText(c, state, data)
        if (ComponentMetadataType.HorizontalLayout == t) return renderHorizontalLayout(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.VerticalLayout == t) return renderVerticalLayout(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.SplitLayout == t) return renderSplitLayout(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.Badge == t) return renderBadge(c)
        if (ComponentMetadataType.Anchor == t) return renderAnchor(c)
        if (ComponentMetadataType.Dialog == t) return renderDialog(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.ConfirmDialog == t) return renderConfirmDialog(container, c, baseUrl, state, data, appState, appData)
        if (ComponentMetadataType.TabLayout == t) {
            return html`<mateu-redhat-tabs .component="${c}" .container="${container}" baseUrl="${baseUrl}" .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"></mateu-redhat-tabs>`
        }
        if (ComponentMetadataType.AccordionLayout == t) {
            return html`<mateu-redhat-accordion .component="${c}" .container="${container}" baseUrl="${baseUrl}" .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"></mateu-redhat-accordion>`
        }

        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    /**
     * mateu-table-crud delegates ALL crud grid layouts (table, list, cards, masterDetail, tree)
     * to renderTableComponent instead of rendering the non-table ones with the shared
     * Vaadin-flavoured templates.
     */
    rendersCrudLayouts(): boolean {
        return true
    }
    renderTableComponent(container: any, component: ClientSideComponent | undefined): TemplateResult {
        return renderCrudLayout(container, component!)
    }
    /**
     * Crud/content-header toolbar buttons as PatternFly buttons (instead of the shared
     * vaadin-button default). `label` arrives already interpolated.
     *
     * The button carries BOTH the pf-v6-c-button classes and equivalent inline styles: the hook
     * is consumed from mateu-table-crud (light DOM here → global PF CSS applies) but ALSO from
     * mateu-content-header, which renders in its own shadow root where the global stylesheet
     * cannot reach — the inline PF-token styles keep the button looking like PF6 there too
     * (same reason redwood hand-styles its toolbar button).
     */
    renderToolbarButton(button: unknown, label: string, onClick: () => void): TemplateResult {
        const btn = button as { id?: string; actionId?: string; label?: string; buttonStyle?: string; color?: string; variant?: string; disabled?: boolean }
        const kind =
            btn.color === 'error' || btn.color === 'danger' || btn.variant === 'error' || btn.variant === 'danger' ? 'danger'
            : btn.buttonStyle === 'primary' || btn.color === 'primary' ? 'primary'
            : 'secondary'
        const skin = kind === 'danger'
            ? 'background: var(--pf-t--global--color--status--danger--default, #b1380b); color: #fff; border: 1px solid transparent;'
            : kind === 'primary'
            ? 'background: var(--pf-t--global--color--brand--default, #0066cc); color: #fff; border: 1px solid transparent;'
            : 'background: transparent; color: var(--pf-t--global--color--brand--default, #0066cc); border: 1px solid var(--pf-t--global--color--brand--default, #0066cc);'
        return html`
            <button type="button"
                    class="pf-v6-c-button pf-m-${kind}"
                    style="${skin} border-radius: 999px; height: 2.25rem; padding: 0 1rem; font-family: inherit; font-size: .875rem; cursor: pointer; ${btn.disabled ? 'opacity: .5; pointer-events: none;' : ''}"
                    data-action-id="${btn.id ?? nothing}"
                    ?disabled="${btn.disabled}"
                    @click="${onClick}">
                <span class="pf-v6-c-button__text">${label}</span>
            </button>`
    }
    renderFilterBar(container: any, component: ClientSideComponent | undefined, baseUrl?: string, state?: any, data?: any, appState?: any, appData?: any, searchOnly?: boolean): TemplateResult {
        // The shared <mateu-filter-bar> is design-system-neutral (Lumo vars + fallbacks) and
        // renders the full smart-search UI (ranges, multi-select, booleans, date pickers). The
        // old PatternFly-local filter bar only had a search box, so use the shared one.
        return super.renderFilterBar(container, component, baseUrl, state, data, appState, appData, searchOnly)
    }
    renderPagination(container: any, component: ClientSideComponent | undefined): TemplateResult {
        return renderPagination(container, component)
    }
}
