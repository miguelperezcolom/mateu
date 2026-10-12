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

/**
 * The hero tones (HeroTone, the Redwood welcome-page backgroundColor idea) as Mateu's OWN deep hues
 * — not Oracle's swatches. Every renderer uses the same nine values so a tone reads the same on
 * every shell; ink stays light on all of them.
 */
export const HERO_TONES: Record<string, string> = {
    ocean: '#1f4e79',
    pine: '#2d5a3d',
    lilac: '#5b4a7a',
    teal: '#1f5c5c',
    rose: '#7a3b4f',
    pebble: '#5a5550',
    slate: '#3d4a57',
    plum: '#5e3557',
    sienna: '#7a4a2e',
}

/**
 * The hero is a DARK surface inside a (usually) light page, so the theme's text tokens are wrong
 * inside it: a tertiary/secondary CTA ("See the dashboard") painted with --lumo-primary-text-color
 * is blue on deep teal — about 1.6:1, unreadable (WCAG 1.4.3). Re-pointing the text tokens at the
 * hero's light ink makes every non-primary control inside legible; a primary button keeps its own
 * filled background and contrast text.
 */
export const HERO_INK_TOKENS =
    '--lumo-primary-text-color: var(--mateu-hero-ink, #fff); --lumo-body-text-color: var(--mateu-hero-ink, #fff);' +
    ' --lumo-secondary-text-color: var(--mateu-hero-ink-secondary, rgba(255, 255, 255, .88));' + // design-token-ok: light ink on the hero's dark band
    ' --lumo-contrast-5pct: rgba(255, 255, 255, .12); --lumo-contrast-10pct: rgba(255, 255, 255, .18);' // design-token-ok: light ink on the hero's dark band

/** The band background for a hero: its declared tone, else the themed default. */
export const heroBackground = (tone: string | undefined): string =>
    (tone && HERO_TONES[tone]) ?? HERO_BACKGROUND

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
        <div class="mateu-hero ${component.cssClasses??''}" data-tone="${metadata.tone ?? nothing}"
             style="position: relative; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--lumo-border-radius-l, 12px); margin-top: var(--mateu-hero-margin-top, var(--lumo-space-l, 1.5rem)); min-height: ${metadata.height ?? '12rem'}; box-sizing: border-box; background: ${heroBackground(metadata.tone)}; color: var(--mateu-hero-ink, #fff); ${HERO_INK_TOKENS} ${component.style??''}"
             slot="${component.slot??nothing}"
        >
            ${image ? html`<div class="mateu-hero-image" aria-hidden="true"
                 style="position: absolute; inset: 0 0 0 auto; width: min(55%, 40rem); background-image: ${image}; background-repeat: no-repeat; background-position: right center; background-size: auto 150%; pointer-events: none;"></div>` : nothing}
            <div class="mateu-hero-text"
                 style="position: relative; flex: 1; display: flex; flex-direction: column; align-items: ${alignment}; justify-content: center; gap: var(--lumo-space-s, .5rem); text-align: ${textAlign}; padding: var(--lumo-space-xl, 2.5rem); ${image ? 'max-width: min(60%, 42rem);' : ''} box-sizing: border-box;">
                ${metadata.title?html`<h1 style="margin: 0; font-family: var(--lumo-font-family); font-size: var(--lumo-font-size-xxxl, 2.5rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; color: inherit;">${metadata.title}</h1>`:nothing}
                ${metadata.subtitle?html`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); color: var(--lumo-secondary-text-color); max-width: 40rem;">${metadata.subtitle}</p>`:nothing}
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
