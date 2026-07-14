import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import FileItem from "@mateu/shared/apiClients/dtos/componentmetadata/FileItem";

const ICONS: Record<string, string> = {
    pdf: '📕', image: '🖼️', img: '🖼️', doc: '📘', docx: '📘', word: '📘',
    xls: '📗', xlsx: '📗', excel: '📗', sheet: '📗', zip: '🗜️', archive: '🗜️',
    video: '🎬', audio: '🎵', code: '💻', csv: '📄', txt: '📄',
}

/**
 * Dependency-free attachment list: each file shows a type icon, its name and size. A file with a
 * url is a download link; one with an actionId dispatches the standard action-requested event.
 * DS-neutral, dark-mode aware.
 */
@customElement('mateu-file-list')
export class MateuFileList extends LitElement {

    @property({ type: Array }) files: FileItem[] = []

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .file { display: flex; align-items: center; gap: .7rem; padding: .65rem .9rem; text-decoration: none; color: inherit; }
        .file + .file { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        .file.clickable { cursor: pointer; }
        .file.clickable:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.02)); }
        .icon { font-size: 1.3rem; flex: 0 0 auto; }
        .name { flex: 1; min-width: 0; font-weight: 500; color: var(--lumo-body-text-color, #222); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .size { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); flex: 0 0 auto; }
        .dl { color: var(--lumo-primary-color, #1a73e8); flex: 0 0 auto; }
    `

    private icon(type?: string): string {
        return (type && ICONS[type.toLowerCase()]) || '📄'
    }

    private clickFile(file: FileItem, e: Event) {
        if (file.url) {
            return // let the <a> handle the download
        }
        if (file.actionId) {
            e.preventDefault()
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId: file.actionId, parameters: { _file: file } },
                bubbles: true,
                composed: true
            }))
        }
    }

    render() {
        return html`
            <div class="list">
                ${this.files.map(file => {
                    const clickable = !!file.url || !!file.actionId
                    const inner = html`
                        <span class="icon">${this.icon(file.type)}</span>
                        <span class="name">${file.name}</span>
                        ${file.size ? html`<span class="size">${file.size}</span>` : nothing}
                        ${file.url ? html`<span class="dl">⬇</span>` : nothing}
                    `
                    return file.url
                        ? html`<a class="file clickable" href="${file.url}" download target="_blank" rel="noopener">${inner}</a>`
                        : html`<div class="file ${clickable ? 'clickable' : ''}" @click="${(e: Event) => this.clickFile(file, e)}">${inner}</div>`
                })}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-file-list": MateuFileList
    }
}
