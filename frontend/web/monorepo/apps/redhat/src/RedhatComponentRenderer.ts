import { LitElement, html, type TemplateResult } from 'lit'
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType.ts'
import { MateuComponent } from '@infra/ui/mateu-component.ts'
import { renderApp } from '@/renderers/renderApp.ts'
import {
    renderButton, renderText, renderFormLayout, renderForm, renderFormSection, renderFormSubSection,
    renderCard, renderHorizontalLayout, renderVerticalLayout, renderSplitLayout, renderBadge,
    renderAnchor, renderDialog, renderConfirmDialog, renderTable, renderPagination,
} from '@/renderers/patternfly.ts'
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
            return html`<mateu-redhat-field id="${c.id}" .component="${c}" .field="${c.metadata}" .state="${state}" .labelAlreadyRendered="${labelAlreadyRendered}"></mateu-redhat-field>`
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

    renderTableComponent(container: any, component: ClientSideComponent | undefined): TemplateResult {
        return renderTable(container, component!)
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
