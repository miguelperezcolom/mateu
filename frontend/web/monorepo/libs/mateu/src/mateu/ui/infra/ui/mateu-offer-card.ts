import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';

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
                <div class="footer">
                    ${this.current
                        ? (this.currentLabel ? html`<span class="current-label">${this.currentLabel}</span>` : nothing)
                        : (this.actionLabel && this.actionId ? html`
                            <button class="${this.added ? 'added' : ''}" @click="${() => this.runAction()}">
                                <span>${this.added ? (this.addedLabel || this.actionLabel) : this.actionLabel}</span>
                                ${this.priceLabel ? html`<span class="price">${this.priceLabel}</span>` : nothing}
                            </button>
                        ` : nothing)}
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-offer-card": MateuOfferCard
    }
}
