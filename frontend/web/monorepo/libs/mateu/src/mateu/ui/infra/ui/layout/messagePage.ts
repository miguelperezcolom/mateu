import { css, unsafeCSS } from 'lit'

/**
 * The Message page template (MessagePage, PageTemplates.message on the server): ONE card near the
 * top of a full-bleed illustrated background, with no app chrome around it — a confirmation, "check
 * your email", an error, a signed-out page, a sign-in form.
 *
 * The server lays it out as ordinary components (`message-page` › `message-card` › title, body,
 * actions, footer) carrying these classes; the look is drawn here, with Lumo tokens, so it follows
 * the theme and dark mode. The illustration is Mateu's own (organic shapes in ochre, terracotta,
 * sand and slate, with a light grain), drawn on a fixed canvas anchored top-left the way a large
 * illustration image is (2560px wide, never scaled to cover); `--mateu-message-page-image` (the
 * template's `image`) replaces it, and a tone class (`mateu-message-page--<tone>`) tints it.
 * Every colour below is a FALLBACK of a token an app can set: the shapes are mixed with
 * `--lumo-base-color`, so they deepen in dark mode with the card.
 */

export { pageTemplateOf, pageOwnsViewport } from './templatePageTypes.ts'

/** The grain over the illustration: fractal noise, faint (an inline SVG, nothing fetched). */
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E")`

export const MESSAGE_PAGE_STYLES = css`
    .mateu-message-page {
        /* the palette (Mateu's own hues, not an image's); a tone class re-points the first two */
        --_mp-base: var(--lumo-base-color, #fff);
        --_mp-canvas: color-mix(in srgb, var(--mateu-message-page-canvas, #efe6d9) 82%, var(--_mp-base));
        --_mp-a: color-mix(in srgb, var(--mateu-message-page-shape-a, #c9714c) 78%, var(--_mp-base));
        --_mp-b: color-mix(in srgb, var(--mateu-message-page-shape-b, #d9a44a) 80%, var(--_mp-base));
        --_mp-c: color-mix(in srgb, var(--mateu-message-page-shape-c, #4f6272) 74%, var(--_mp-base));
        --_mp-d: color-mix(in srgb, var(--mateu-message-page-shape-d, #e3cdb0) 85%, var(--_mp-base));
        --_mp-e: color-mix(in srgb, var(--mateu-message-page-shape-e, #9c4a32) 70%, var(--_mp-base));
        box-sizing: border-box;
        width: 100%;
        min-height: 100dvh;
        align-items: center;
        /* top-anchored with a generous margin above the card (not vertically centred) */
        padding: calc(var(--lumo-space-xl, 2.5rem) * 3.2) var(--lumo-space-m, 1rem) var(--lumo-space-xl, 2.5rem);
        background-color: var(--_mp-canvas);
        background-image:
            ${unsafeCSS(GRAIN)},
            radial-gradient(150px 105px at 1180px 655px, var(--_mp-c) 0 calc(100% - 1px), transparent 100%),
            radial-gradient(70px 70px at 290px 170px, var(--_mp-b) 0 calc(100% - 1px), transparent 100%),
            radial-gradient(620px 430px at 1560px 30px, var(--_mp-b) 0 calc(100% - 1px), transparent 100%),
            radial-gradient(330px 250px at 1330px 330px, var(--_mp-e) 0 calc(100% - 1px), transparent 100%),
            radial-gradient(560px 420px at 40px 640px, var(--_mp-a) 0 calc(100% - 1px), transparent 100%),
            radial-gradient(260px 190px at 360px 820px, var(--_mp-c) 0 calc(100% - 1px), transparent 100%),
            radial-gradient(1150px 330px at 980px 1060px, var(--_mp-c) 0 calc(100% - 1px), transparent 100%),
            radial-gradient(920px 520px at 420px 90px, var(--_mp-d) 0 calc(100% - 1px), transparent 100%);
        background-repeat: repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat;
        background-size: 240px 240px, max(2560px, 100%) max(1440px, 100%), max(2560px, 100%) max(1440px, 100%),
            max(2560px, 100%) max(1440px, 100%), max(2560px, 100%) max(1440px, 100%), max(2560px, 100%) max(1440px, 100%),
            max(2560px, 100%) max(1440px, 100%), max(2560px, 100%) max(1440px, 100%), max(2560px, 100%) max(1440px, 100%);
        background-position: 0 0;
    }
    /* the template's own image replaces the illustration: anchored top-left at 2560px wide */
    .mateu-message-page[style*='--mateu-message-page-image'] {
        background-image: var(--mateu-message-page-image);
        background-repeat: no-repeat;
        background-size: max(2560px, 100%) auto;
    }
    /* a tone (the welcome palette) tints the two dominant shapes */
    .mateu-message-page--ocean { --mateu-message-page-shape-a: var(--mateu-message-tone-ocean, #1f4e79); --mateu-message-page-shape-e: var(--mateu-message-tone-ocean, #1f4e79); }
    .mateu-message-page--pine { --mateu-message-page-shape-a: var(--mateu-message-tone-pine, #2d5a3d); --mateu-message-page-shape-e: var(--mateu-message-tone-pine, #2d5a3d); }
    .mateu-message-page--lilac { --mateu-message-page-shape-a: var(--mateu-message-tone-lilac, #5b4a7a); --mateu-message-page-shape-e: var(--mateu-message-tone-lilac, #5b4a7a); }
    .mateu-message-page--teal { --mateu-message-page-shape-a: var(--mateu-message-tone-teal, #1f5c5c); --mateu-message-page-shape-e: var(--mateu-message-tone-teal, #1f5c5c); }
    .mateu-message-page--rose { --mateu-message-page-shape-a: var(--mateu-message-tone-rose, #7a3b4f); --mateu-message-page-shape-e: var(--mateu-message-tone-rose, #7a3b4f); }
    .mateu-message-page--pebble { --mateu-message-page-shape-a: var(--mateu-message-tone-pebble, #5a5550); --mateu-message-page-shape-e: var(--mateu-message-tone-pebble, #5a5550); }
    .mateu-message-page--slate { --mateu-message-page-shape-a: var(--mateu-message-tone-slate, #3d4a57); --mateu-message-page-shape-e: var(--mateu-message-tone-slate, #3d4a57); }
    .mateu-message-page--plum { --mateu-message-page-shape-a: var(--mateu-message-tone-plum, #5e3557); --mateu-message-page-shape-e: var(--mateu-message-tone-plum, #5e3557); }
    .mateu-message-page--sienna { --mateu-message-page-shape-a: var(--mateu-message-tone-sienna, #7a4a2e); --mateu-message-page-shape-e: var(--mateu-message-tone-sienna, #7a4a2e); }

    /* the card: the light surface, the small radius, no shadow */
    .mateu-message-card {
        box-sizing: border-box;
        width: min(100%, var(--mateu-message-card-width, 28.75rem));
        margin: 0;
        padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem);
        background: var(--mateu-message-card-surface, var(--lumo-base-color, #fff));
        color: var(--lumo-body-text-color, inherit);
        border-radius: var(--lumo-border-radius-s, 4px);
        box-shadow: none;
        border: none;
        --vaadin-card-background: var(--mateu-message-card-surface, var(--lumo-base-color, #fff));
        --vaadin-card-shadow: none;
        --vaadin-card-border-width: 0;
    }
    .mateu-message-card-content {
        width: 100%;
        align-items: stretch;
    }
    .mateu-message-overline {
        color: var(--lumo-secondary-text-color, inherit);
        font-size: var(--lumo-font-size-s, .875rem);
        font-weight: 500;
    }
    .mateu-message-title {
        font-size: var(--lumo-font-size-xxl, 1.75rem);
        font-weight: 600;
        line-height: var(--lumo-line-height-xs, 1.25);
        color: var(--lumo-header-text-color, inherit);
    }
    .mateu-message-subtitle {
        color: var(--lumo-secondary-text-color, inherit);
    }
    .mateu-message-body {
        width: 100%;
        align-items: stretch;
        line-height: var(--lumo-line-height-m, 1.625);
    }
    .mateu-message-body > p,
    .mateu-message-body > div {
        margin-block: 0;
    }
    .mateu-message-actions {
        width: 100%;
        align-items: center;
    }
    /* a sign-in style card: its one primary action spans the card */
    .mateu-message-actions > vaadin-button[theme~='primary']:only-child {
        flex: 1 1 100%;
    }
    .mateu-message-footer {
        width: 100%;
        justify-content: center;
        margin-top: var(--lumo-space-s, .5rem);
        padding-top: var(--lumo-space-m, 1rem);
        border-top: 1px solid var(--lumo-contrast-10pct, transparent);
        font-size: var(--lumo-font-size-s, .875rem);
        color: var(--lumo-secondary-text-color, inherit);
    }
    .mateu-message-footer a {
        color: inherit;
    }
    /* a phone: 16px gutters, the card takes the width, less air above it */
    @media (max-width: 600px) {
        .mateu-message-page {
            padding-top: var(--lumo-space-xl, 2.5rem);
        }
        .mateu-message-card {
            padding: var(--lumo-space-l, 1.5rem) var(--lumo-space-m, 1rem);
        }
    }
`
