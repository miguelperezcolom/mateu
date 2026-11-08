import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';

export type OfferFooter =
    | { kind: 'current', label: string | undefined }
    | { kind: 'cta', label: string | undefined, price: string | undefined, added: boolean, enabled: boolean }
    | { kind: 'price', price: string }

/**
 * What an offer card's footer shows. The CTA (its label, or the addedLabel once added, with the
 * price inside) shows whenever it has something to say — without an actionId it is drawn INERT
 * rather than dropped: a card used to lose its price and its CTA, and `added` showed nothing, when
 * it carried no action (a static page, a YAML partial). A price alone still shows.
 */
export const offerFooterOf = (card: {
    current?: boolean, currentLabel?: string, priceLabel?: string, actionLabel?: string,
    actionId?: string, added?: boolean, addedLabel?: string,
}): OfferFooter | null => {
    if (card.current) return { kind: 'current', label: card.currentLabel }
    const added = !!card.added
    const label = added ? (card.addedLabel || card.actionLabel) : card.actionLabel
    if (label) return { kind: 'cta', label, price: card.priceLabel, added, enabled: !!card.actionId }
    if (card.priceLabel) return { kind: 'price', price: card.priceLabel }
    return null
}

/**
 * Current-vs-upgrade offer card: optional 16:9 image header with a floating tag chip, title +
 * subtitle, features as outline chips, and a footer that is either a muted "included" label (when
 * `current`) or a full-width primary CTA with the price right-aligned inside, dispatching the
 * standard action-requested event. Non-current cards get an accent border. DS-neutral, dark-mode aware.
 */
@customElement('mateu-offer-card')
export class MateuOfferCard extends LitElement {

    @property() tag: string | undefined
    @property() title = ''
    @property() subtitle: string | undefined
    @property() image: string | undefined
    @property({ type: Array }) features: string[] = []
    @property() priceLabel: string | undefined
    @property() actionLabel: string | undefined
    @property() actionId: string | undefined
    @property({ type: Boolean }) current = false
    @property() currentLabel: string | undefined
    /** toggle state (server-driven): the CTA turns success green and shows addedLabel */
    @property({ type: Boolean }) added = false
    @property() addedLabel: string | undefined

    static styles = css`
        /* explicit line-height: inside a form field wrapper the inherited one is the 44px
           field height, which blows up every text row */
        :host { display: block; width: 100%; line-height: var(--lumo-line-height-m, 1.4); }
        .card {
            position: relative; display: flex; flex-direction: column;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
            background: var(--lumo-base-color, transparent);
        }
        .card.offer { border-color: var(--lumo-primary-color, #1a73e8); }
        .image { aspect-ratio: 16 / 9; width: 100%; object-fit: cover; display: block; }
        /* the tag is a regular small badge (tinted background + primary ink) */
        .tag {
            position: absolute; top: .7rem; left: .7rem;
            font-size: var(--lumo-font-size-xxs, .65rem); font-weight: 600; letter-spacing: .03em;
            line-height: 1.4;
            padding: .1rem .45rem; border-radius: var(--lumo-border-radius-s, 4px);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            color: var(--lumo-primary-text-color, #1a73e8);
            white-space: nowrap;
        }
        /* floating over an image it needs a solid background for contrast */
        .card > .tag {
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .tag.static { position: static; align-self: flex-start; margin-bottom: .25rem; }
        .body { display: flex; flex-direction: column; gap: .3rem; padding: var(--lumo-space-m, 1rem); flex: 1; }
        .title {
            font-size: var(--lumo-font-size-l, 1.125rem); font-weight: 700;
            color: var(--lumo-body-text-color, #111);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .subtitle {
            font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .features { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .35rem; }
        .feature {
            font-size: var(--lumo-font-size-xs, .75rem);
            padding: .1rem .55rem; border-radius: 999px;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            color: var(--lumo-secondary-text-color, #666);
            white-space: nowrap;
        }
        .footer { padding: 0 var(--lumo-space-m, 1rem) var(--lumo-space-m, 1rem); }
        .current-label {
            display: block; text-align: center; padding: .45rem 0;
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 500;
            color: var(--lumo-secondary-text-color, #888);
        }
        button {
            display: flex; align-items: center; justify-content: space-between; gap: .8rem;
            width: 100%; box-sizing: border-box;
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            padding: .5rem .9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: none; cursor: pointer;
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
        }
        button:hover { filter: brightness(1.08); }
        /* an inert CTA (no actionId): drawn the same, not clickable */
        button:disabled { cursor: default; filter: none; }
        .price-only {
            display: block; text-align: right; padding: .45rem 0;
            font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-body-text-color, #111);
        }
        button.added { background: var(--lumo-success-color, #2e7d32); }
        .price { font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
    `

    private runAction() {
        if (!this.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.actionId, parameters: {} },
            bubbles: true,
            composed: true
        }))
    }

    private renderFooter() {
        const footer = offerFooterOf(this)
        if (!footer) return nothing
        if (footer.kind === 'current') {
            return footer.label ? html`<span class="current-label">${footer.label}</span>` : nothing
        }
        if (footer.kind === 'price') {
            return html`<span class="price-only"><span class="price">${footer.price}</span></span>`
        }
        return html`
            <button class="${footer.added ? 'added' : ''}" ?disabled="${!footer.enabled}"
                    @click="${() => this.runAction()}">
                <span>${footer.label}</span>
                ${footer.price ? html`<span class="price">${footer.price}</span>` : nothing}
            </button>
        `
    }

    render() {
        return html`
            <div class="card ${this.current ? '' : 'offer'}">
                ${this.image ? html`<img class="image" src="${this.image}" alt="${this.title}">` : nothing}
                ${this.tag && this.image ? html`<span class="tag">${this.tag}</span>` : nothing}
                <div class="body">
                    ${this.tag && !this.image ? html`<span class="tag static">${this.tag}</span>` : nothing}
                    <span class="title">${this.title}</span>
                    ${this.subtitle ? html`<span class="subtitle">${this.subtitle}</span>` : nothing}
                    ${this.features.length ? html`
                        <div class="features">
                            ${this.features.map(feature => html`<span class="feature">${feature}</span>`)}
                        </div>
                    ` : nothing}
                </div>
                <div class="footer">${this.renderFooter()}</div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-offer-card": MateuOfferCard
    }
}
