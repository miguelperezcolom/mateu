import { customElement, property, state } from 'lit/decorators.js'
import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from 'lit'
import { Banner } from '@mateu/shared/apiClients/dtos/componentmetadata/Banner'
import { interpolate } from './interpolation'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types'

/**
 * The banners of a `type: Form` page (a YAML page's `banners:`) — the same strip `mateu-page` draws
 * for a reflected page's `@Banner`s: light pastel per theme, `${state.x}` interpolated, a ✕ when
 * `closeable`, and gone after `timeoutSeconds`. Design-system neutral, so every web shell draws it.
 */
@customElement('mateu-form-banners')
export class MateuFormBanners extends LitElement {

    @property({ attribute: false }) banners: Banner[] = []
    @property({ attribute: false }) state: ComponentState = {}
    @property({ attribute: false }) data: ComponentData = {}

    @state() private dismissed = new Set<number>()
    private timers: ReturnType<typeof setTimeout>[] = []

    protected willUpdate(changed: PropertyValues) {
        if (changed.has('banners')) {
            this.timers.forEach(clearTimeout)
            this.timers = []
            this.dismissed = new Set()
            ;(this.banners ?? []).forEach((banner, i) => {
                if (banner.timeoutSeconds && banner.timeoutSeconds > 0) {
                    this.timers.push(setTimeout(() => this.dismiss(i), banner.timeoutSeconds * 1000))
                }
            })
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.timers.forEach(clearTimeout)
        this.timers = []
    }

    private dismiss(index: number) {
        this.dismissed = new Set([...this.dismissed, index])
    }

    private renderBanner(banner: Banner, index: number): TemplateResult {
        const title = interpolate(banner.title, this.state, this.data)
        const description = interpolate(banner.description, this.state, this.data)
        const theme = (banner.theme as unknown as string | undefined)?.toLowerCase() ?? 'info'
        return html`
            <div class="page-banner page-banner--${theme === 'none' ? '' : theme}">
                ${title || banner.hasCloseButton ? html`
                    <div class="head">
                        <span class="title">${title ?? ''}</span>
                        ${banner.hasCloseButton ? html`
                            <button class="banner-close" @click=${() => this.dismiss(index)}
                                    title="${chromeText('dismiss')}" aria-label="${chromeText('dismiss')}">✕</button>` : nothing}
                    </div>` : nothing}
                ${description ? html`<p>${description}</p>` : nothing}
            </div>`
    }

    render() {
        const visible = (this.banners ?? []).map((banner, index) => ({ banner, index }))
            .filter(({ index }) => !this.dismissed.has(index))
        if (!visible.length) return nothing
        return html`<div class="page-banners">${visible.map(({ banner, index }) => this.renderBanner(banner, index))}</div>`
    }

    static styles = css`
        :host { display: block; }
        .page-banners { display: flex; flex-direction: column; gap: 0.5rem; padding-block: 0 0.5rem; }
        .page-banner {
            box-sizing: border-box; width: 100%; color: #1a1a1a;
            padding: var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-l, 12px);
        }
        .page-banner p { margin: 0; color: #1a1a1a; }
        .head { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .title { font-weight: 600; }
        .banner-close { color: #1a1a1a; border: none; background: transparent; cursor: pointer; font-size: .875rem; line-height: 1; }
        .page-banner--info { background: #e8f4fd; }
        .page-banner--success { background: #eafaf1; }
        .page-banner--warning { background: #fef9e7; }
        .page-banner--danger { background: #fdf2f2; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-form-banners': MateuFormBanners
    }
}
