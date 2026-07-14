import { css, html, LitElement, nothing, TemplateResult } from "lit";
import { customElement, property } from 'lit/decorators.js';
import Comment from "@mateu/shared/apiClients/dtos/componentmetadata/Comment";

/**
 * Dependency-free discussion thread: each comment shows its author, avatar, timestamp and text;
 * nested replies are indented under their parent with a connecting rail. Read-only. DS-neutral,
 * dark-mode aware.
 */
@customElement('mateu-comment-thread')
export class MateuCommentThread extends LitElement {

    @property({ type: Array }) comments: Comment[] = []

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .thread { display: flex; flex-direction: column; gap: 1rem; }
        .replies {
            display: flex; flex-direction: column; gap: 1rem;
            margin: .75rem 0 0 1.1rem; padding-left: 1rem;
            border-left: 2px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
        }
        .comment { display: flex; gap: .6rem; }
        .avatar {
            width: 2rem; height: 2rem; border-radius: 50%; flex: 0 0 auto;
            background: var(--lumo-contrast-10pct, #eee);
            display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .body { flex: 1; min-width: 0; }
        .head { display: flex; align-items: baseline; gap: .5rem; }
        .author { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .time { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); }
        .text { color: var(--lumo-body-text-color, #333); margin-top: .15rem; line-height: 1.5; }
    `

    private renderComment(comment: Comment): TemplateResult {
        const isImg = comment.avatar && (comment.avatar.startsWith('http') || comment.avatar.startsWith('data:'))
        return html`
            <div class="comment">
                <span class="avatar">${comment.avatar ? (isImg ? html`<img src="${comment.avatar}" alt="">` : comment.avatar) : (comment.author?.[0] ?? '?')}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${comment.author}</span>
                        ${comment.timestamp ? html`<span class="time">${comment.timestamp}</span>` : nothing}
                    </div>
                    <div class="text">${comment.text}</div>
                    ${comment.replies && comment.replies.length
                        ? html`<div class="replies">${comment.replies.map(reply => this.renderComment(reply))}</div>`
                        : nothing}
                </div>
            </div>
        `
    }

    render() {
        return html`<div class="thread">${this.comments.map(c => this.renderComment(c))}</div>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-comment-thread": MateuCommentThread
    }
}
