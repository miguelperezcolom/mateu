import { customElement, property, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'
import type FoldoutLayout from '@mateu/shared/apiClients/dtos/componentmetadata/FoldoutLayout'
import type FoldoutPanelInfo from '@mateu/shared/apiClients/dtos/componentmetadata/FoldoutPanelInfo'
import type FoldoutNavigation from '@mateu/shared/apiClients/dtos/componentmetadata/FoldoutNavigation'

/**
 * Redwood (Oracle Spectra Shell) foldout page template.
 *
 * Overrides the design-system-neutral `mateu-foldout` for the redwood-oj renderer: instead of the
 * Lumo-var skin it emits the Oracle **Spectra Shell** light-DOM (`oj-sp-foldout-layout` /
 * `oj-sp-header-navigation` / `oj-sp-foldout-panel`), styled by the vendored
 * `public/oj-sp/oj-sp-component-bundle.css` — the same markup Oracle Visual Builder renders for a
 * foldout preview. Structure mirrors that saved DOM; content is driven by mateu's UIDL
 * (`FoldoutLayout` metadata + children slotted "overview" / "panel-N").
 *
 * Light DOM (like mateu-redwood-tabs) so the document-level Spectra CSS reaches the emitted classes.
 * Minimal inline flex backs the key containers so the layout degrades sanely even where a Spectra
 * rule does not apply (some decorative color-strip images are not vendored).
 */
@customElement('mateu-redwood-foldout')
export class MateuRedwoodFoldout extends LitElement {

    @property({ attribute: false }) component: any
    @property({ attribute: false }) container: any
    @property() baseUrl: string | undefined
    @property({ attribute: false }) compState: any
    @property({ attribute: false }) compData: any
    @property({ attribute: false }) appState: any
    @property({ attribute: false }) appData: any

    // Panels the user has folded open (index set). Seeded from each panel's `open` flag on first render.
    @state() private openPanels: Set<number> = new Set()
    private seeded = false

    createRenderRoot() { return this }

    private get md(): FoldoutLayout { return (this.component?.metadata ?? {}) as FoldoutLayout }
    private get panels(): FoldoutPanelInfo[] { return this.md.panels ?? [] }
    private get isHorizontal(): boolean { return (this.md.orientation ?? 'vertical') === 'horizontal' }

    private childForSlot(slot: string): any | undefined {
        return (this.component?.children ?? []).find((c: any) => c?.slot === slot)
    }

    private evalTpl(raw: string | undefined): string {
        if (!raw) return ''
        return raw.includes('${') && this.container?._evalTemplate ? this.container._evalTemplate(raw) : raw
    }

    private dispatchAction(actionId?: string) {
        if (!actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: {} }, bubbles: true, composed: true,
        }))
    }

    private renderChild(child: any): TemplateResult {
        if (!child) return html``
        return renderComponent(this.container, child, this.baseUrl, this.compState, this.compData, this.appState, this.appData)
    }

    // --- Header navigation band (parent link + prev/next between peer objects) --------------------
    private renderNav(nav: FoldoutNavigation | null | undefined): TemplateResult {
        if (!nav) return html``
        const hasNav = nav.parentActionId || nav.previousActionId || nav.nextActionId || nav.title
        if (!hasNav) return html``
        return html`
            <div class="oj-sp-foldout-horizontal-header-panel">
                <div class="oj-sp-foldout-layout-header-horizontal">
                    <oj-sp-header-navigation class="oj-sp-foldout-layout-header-navigation">
                        <header class="oj-sp-header-container"
                                style="display:flex; align-items:center; gap:1rem; padding:.5rem 1rem;">
                            ${nav.parentActionId ? html`
                                <a href="#" class="oj-sp-header-navigation-goToParent oj-sp-link-standalone oj-typography-body-md oj-typography-semi-bold"
                                   @click="${(e: Event) => { e.preventDefault(); this.dispatchAction(nav.parentActionId) }}"
                                >${nav.parentLabel || 'Parent'}</a>` : nothing}
                            ${nav.title ? html`<span class="oj-typography-body-md" style="flex:1 1 auto;">${nav.title}</span>` : html`<span style="flex:1 1 auto;"></span>`}
                            <div class="oj-flex-bar-end" style="display:flex; gap:.25rem;">
                                ${nav.previousActionId ? html`
                                    <button class="oj-sp-header-navigation-previous-btn" title="Previous"
                                            style="background:transparent; border:none; cursor:pointer; padding:.25rem .5rem;"
                                            @click="${() => this.dispatchAction(nav.previousActionId)}"
                                    ><span class="oj-ux-ico-arrow-left"></span></button>` : nothing}
                                ${nav.nextActionId ? html`
                                    <button class="oj-sp-header-navigation-next-btn" title="Next"
                                            style="background:transparent; border:none; cursor:pointer; padding:.25rem .5rem;"
                                            @click="${() => this.dispatchAction(nav.nextActionId)}"
                                    ><span class="oj-ux-ico-arrow-right"></span></button>` : nothing}
                            </div>
                        </header>
                    </oj-sp-header-navigation>
                </div>
            </div>`
    }

    // --- Overview band: title + badges + optional Edit + the "overview" slotted content ----------
    private renderOverview(): TemplateResult {
        const title = this.evalTpl(this.md.headerTitle)
        const badges = this.md.badges ?? []
        const overview = this.childForSlot('overview')
        const editId = this.md.overviewEditActionId
        return html`
            <div class="oj-sp-horizontal-overview" style="padding:.5rem 1rem;">
                <div class="oj-sp-horizontal-overview-title-panel oj-flex-bar"
                     style="display:flex; align-items:center; gap:.75rem;">
                    ${title ? html`<h1 class="oj-sp-horizontal-overview-title oj-typography-subheading-lg" style="margin:0;">${title}</h1>` : nothing}
                    ${badges.map(b => html`<span class="oj-badge oj-badge-subtle" style="padding:.1rem .5rem; border:1px solid rgba(0,0,0,.2); border-radius:999px; font-size:.75rem;">${b}</span>`)}
                    <span style="flex:1 1 auto;"></span>
                    ${editId ? html`
                        <button class="oj-sp-link-standalone" style="background:transparent; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:.25rem; color:var(--mateu-redwood-text, rgb(22,21,19));"
                                @click="${() => this.dispatchAction(editId)}"
                        ><span class="oj-ux-ico-edit"></span>Edit</button>` : nothing}
                </div>
                ${overview ? html`<div class="oj-sp-horizontal-overview-content" style="margin-top:.5rem;">${this.renderChild(overview)}</div>` : nothing}
            </div>`
    }

    // --- A single foldout panel: open (full content) or collapsed (clickable strip) --------------
    private renderPanel(panel: FoldoutPanelInfo, index: number, last: boolean): TemplateResult {
        const isOpen = this.openPanels.has(index)
        const title = this.evalTpl(panel.title)
        const content = this.childForSlot(`panel-${index}`)
        if (!isOpen) {
            // Collapsed strip: narrow column with the rotated title, opens on click (RDS behavior).
            return html`
                <div class="oj-sp-foldout-animation-container oj-sp-foldout-layout-panel-container closed ${last ? 'oj-sp-foldout-layout-last-panel' : ''}"
                     style="cursor:pointer; min-width:2.5rem; display:flex; align-items:flex-start; justify-content:center; border-inline-start:1px solid rgba(0,0,0,.08);"
                     title="${title}"
                     @click="${() => { this.openPanels = new Set(this.openPanels).add(index); }}">
                    <span class="oj-typography-heading-sm" style="writing-mode:vertical-rl; transform:rotate(180deg); margin-top:1rem; white-space:nowrap;">${title}</span>
                </div>`
        }
        return html`
            <div class="oj-sp-foldout-animation-container oj-sp-foldout-layout-panel-container open ${last ? 'oj-sp-foldout-layout-last-panel' : ''}"
                 style="min-width:min(24rem, 90vw); flex:0 0 auto; border-inline-start:1px solid rgba(0,0,0,.08);">
                <oj-sp-foldout-panel class="oj-sp-foldout-panel" style="display:block; padding:1.5rem 1rem;">
                    <div class="oj-sp-foldout-panel-header oj-flex-bar"
                         style="display:flex; align-items:center; gap:.5rem;">
                        <span class="oj-sp-foldout-panel-title oj-typography-heading-sm" title="${title}" style="flex:1 1 auto;">${title}</span>
                        ${this.panels.length > 1 ? html`
                            <button title="Collapse" style="background:transparent; border:none; cursor:pointer;"
                                    @click="${() => { const n = new Set(this.openPanels); n.delete(index); this.openPanels = n; }}"
                            ><span class="oj-ux-ico-close"></span></button>` : nothing}
                    </div>
                    ${panel.subtitle ? html`<div class="oj-typography-body-sm" style="opacity:.75; margin-top:.25rem;">${this.evalTpl(panel.subtitle)}</div>` : nothing}
                    <div class="oj-sp-foldout-panel-title-underline" style="height:1px; background:rgba(0,0,0,.12); margin:.5rem 0 1rem;"></div>
                    <div class="oj-sp-foldout-panel-content">${this.renderChild(content)}</div>
                </oj-sp-foldout-panel>
            </div>`
    }

    render(): TemplateResult {
        if (!this.seeded) {
            this.openPanels = new Set(this.panels.map((p, i) => (p.open ? i : -1)).filter(i => i >= 0))
            // If nothing is flagged open, open the first panel so the page is never blank.
            if (this.openPanels.size === 0 && this.panels.length) this.openPanels.add(0)
            this.seeded = true
        }
        const layoutDir = this.isHorizontal ? 'row' : 'column'
        return html`
            <div class="oj-sp-foldout-layout" style="display:flex; flex-direction:column; width:100%; ${this.component?.style ?? ''}"
                 slot="${this.component?.slot ?? nothing}">
                <div class="oj-sp-foldout-layout-${this.isHorizontal ? 'horizontal' : 'vertical'} oj-sp-foldout-layout-${this.isHorizontal ? 'horizontal' : 'vertical'}-ready">
                    ${this.renderNav(this.md.navigation)}
                    ${this.renderOverview()}
                    <div class="oj-sp-foldout-horizontal-scroll-container" style="overflow-x:auto;">
                        <div class="oj-sp-foldout-layout-horizontal-content oj-sp-foldout-layout-children-container"
                             style="display:flex; flex-direction:${layoutDir}; align-items:stretch;">
                            ${this.panels.map((p, i) => this.renderPanel(p, i, i === this.panels.length - 1))}
                        </div>
                    </div>
                </div>
            </div>`
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-redwood-foldout': MateuRedwoodFoldout }
}
