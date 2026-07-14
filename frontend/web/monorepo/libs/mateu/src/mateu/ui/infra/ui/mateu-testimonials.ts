import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import Testimonial from "@mateu/shared/apiClients/dtos/componentmetadata/Testimonial";

/**
 * Dependency-free testimonials grid: quote cards with an author (avatar + name + role) and an
 * optional star rating. Auto-fits columns to the viewport. DS-neutral, dark-mode aware.
 */
@customElement('mateu-testimonials')
export class MateuTestimonials extends LitElement {

    @property({ type: Array }) items: Testimonial[] = []

    static styles = css`
        :host { display: block; width: 100%; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: var(--lumo-space-m, 1rem); }
        .card {
            display: flex; flex-direction: column; gap: .6rem;
            padding: var(--lumo-space-m, 1.25rem);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, #fff);
        }
        .stars { color: #f5a623; letter-spacing: 1px; font-size: .95rem; }
        .quote { color: var(--lumo-body-text-color, #333); font-style: italic; line-height: 1.5; flex: 1; }
        .quote::before { content: '“'; }
        .quote::after { content: '”'; }
        .author { display: flex; align-items: center; gap: .6rem; }
        .avatar {
            width: 2.2rem; height: 2.2rem; border-radius: 50%;
            background: var(--lumo-contrast-10pct, #eee);
            display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .name { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .role { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); }
        @media (prefers-color-scheme: dark) { .card { background: var(--lumo-contrast-5pct, #2a2a2a); } }
    `

    private stars(rating: number) {
        const r = Math.max(0, Math.min(5, rating || 0))
        return '★'.repeat(r) + '☆'.repeat(5 - r)
    }

    render() {
        return html`
            <div class="grid">
                ${this.items.map(item => {
                    const isImg = item.avatar && (item.avatar.startsWith('http') || item.avatar.startsWith('data:'))
                    return html`
                        <div class="card">
                            ${item.rating ? html`<div class="stars">${this.stars(item.rating)}</div>` : nothing}
                            <div class="quote">${item.quote}</div>
                            <div class="author">
                                ${item.avatar ? html`<span class="avatar">${isImg ? html`<img src="${item.avatar}" alt="">` : item.avatar}</span>` : nothing}
                                <div>
                                    <div class="name">${item.author}</div>
                                    ${item.role ? html`<div class="role">${item.role}</div>` : nothing}
                                </div>
                            </div>
                        </div>
                    `
                })}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-testimonials": MateuTestimonials
    }
}
