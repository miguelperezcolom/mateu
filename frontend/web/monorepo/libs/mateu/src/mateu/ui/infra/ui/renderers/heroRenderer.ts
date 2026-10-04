import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import HeroSection from "@mateu/shared/apiClients/dtos/componentmetadata/HeroSection";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/**
 * The hero's background: the app's accent (@App(accentColor) → --mateu-accent) deepened, as
 * Redwood's welcome banner sits on a deep tone of the theme; with no accent, a deep ocean blue (the
 * RDS welcome palette's). An app can set --mateu-hero-background itself.
 */
export const HERO_BACKGROUND =
    'var(--mateu-hero-background, color-mix(in srgb, var(--mateu-accent, #1f6f8f) 78%, #0b1a24))'

/** The hero image's URL as a CSS url() — or nothing when it would end the declaration. */
export const heroImageCss = (image: string | undefined): string | undefined =>
    image && /^[\w\s/.:%~?&=#+,@-]+$/.test(image.trim()) ? `url("${image.trim()}")` : undefined

/**
 * The hero (a welcome's banner), drawn the way Redwood draws its welcome banner: a deep themed
 * band, the title and the subtitle in light header type on the start side, the app's hero image
 * (`heroImage()`) on the end side — an illustration, not a photo under a dark veil — and the app's
 * accent strip along its foot (mateu-app applyAccent: --mateu-page-band-*). With no image the text
 * keeps the declared alignment.
 */
export const renderHeroSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as HeroSection
    const image = heroImageCss(metadata.image)
    const centered = !image && metadata.centered !== false
    const alignment = centered ? 'center' : 'flex-start'
    const textAlign = centered ? 'center' : 'start'
    return html`
        <div class="mateu-hero ${component.cssClasses??''}"
             style="position: relative; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--lumo-border-radius-l, 12px); margin-top: var(--mateu-hero-margin-top, var(--lumo-space-l, 1.5rem)); min-height: ${metadata.height ?? '12rem'}; box-sizing: border-box; background: ${HERO_BACKGROUND}; color: #fff; ${component.style??''}"
             slot="${component.slot??nothing}"
        >
            ${image ? html`<div class="mateu-hero-image" aria-hidden="true"
                 style="position: absolute; inset: 0 0 0 auto; width: min(55%, 40rem); background-image: ${image}; background-repeat: no-repeat; background-position: right center; background-size: auto 150%; pointer-events: none;"></div>` : nothing}
            <div class="mateu-hero-text"
                 style="position: relative; flex: 1; display: flex; flex-direction: column; align-items: ${alignment}; justify-content: center; gap: var(--lumo-space-s, .5rem); text-align: ${textAlign}; padding: var(--lumo-space-xl, 2.5rem); ${image ? 'max-width: min(60%, 42rem);' : ''} box-sizing: border-box;">
                ${metadata.title?html`<h1 style="margin: 0; font-family: var(--lumo-font-family); font-size: var(--lumo-font-size-xxxl, 2.5rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; color: inherit;">${metadata.title}</h1>`:nothing}
                ${metadata.subtitle?html`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); color: rgba(255, 255, 255, .88); max-width: 40rem;">${metadata.subtitle}</p>`:nothing}
                ${component.children?.length?html`
                    <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${alignment}; width: 100%; max-width: 40rem; margin-top: var(--lumo-space-s, .5rem);">
                        ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
                    </div>
                `:nothing}
            </div>
            <div class="mateu-hero-strip" aria-hidden="true"
                 style="position: relative; flex-shrink: 0; height: var(--mateu-page-band-h, 0px); background-image: var(--mateu-page-band-image, none); background-repeat: repeat-x; background-size: auto 100%;"></div>
        </div>
    `
}
