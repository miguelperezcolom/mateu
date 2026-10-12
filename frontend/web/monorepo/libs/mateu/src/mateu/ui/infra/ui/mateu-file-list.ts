import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import FileItem from "@mateu/shared/apiClients/dtos/componentmetadata/FileItem";
import { onActivate } from '@infra/a11y/activate.ts';
import { activatableFocusStyles } from '@infra/a11y/focusStyles.ts';
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { ifDefined } from 'lit/directives/if-defined.js'
import { icon as dsIcon } from '@infra/ui/renderers/neutralIcon.ts'

// file type → the renderer's icon set (was emoji: a second icon family beside the DS's own)
export const FILE_ICONS: Record<string, string> = {
    pdf: 'vaadin:file-text-o', image: 'vaadin:file-picture', img: 'vaadin:file-picture',
    doc: 'vaadin:file-text-o', docx: 'vaadin:file-text-o', word: 'vaadin:file-text-o',
    xls: 'vaadin:file-table', xlsx: 'vaadin:file-table', excel: 'vaadin:file-table', sheet: 'vaadin:file-table',
    zip: 'vaadin:file-zip', archive: 'vaadin:file-zip', video: 'vaadin:file-movie', audio: 'vaadin:file-sound',
    code: 'vaadin:file-code', csv: 'vaadin:file-table', txt: 'vaadin:file-text-o',
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
        .icon { flex: 0 0 auto; display: inline-flex; color: var(--lumo-secondary-text-color, #5f6b7a); }
        .name { flex: 1; min-width: 0; font-weight: 500; color: var(--lumo-body-text-color, #222); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .size { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); flex: 0 0 auto; }
        .dl { color: var(--lumo-primary-text-color, #1a73e8); flex: 0 0 auto; }
    
        ${activatableFocusStyles}
    `

    private icon(type?: string) {
        return dsIcon((type && FILE_ICONS[type.toLowerCase()]) || 'vaadin:file-o',
            'width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);')
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
                        <span class="icon" aria-hidden="true">${this.icon(file.type)}</span>
                        <span class="name">${file.name}</span>
                        ${file.size ? html`<span class="size">${file.size}</span>` : nothing}
                        ${file.url ? html`<span class="dl" aria-hidden="true">${dsIcon('vaadin:download', 'width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem);')}</span>` : nothing}
                    `
                    return file.url
                        ? html`<a class="file clickable" href="${ifDefined(safeHref(file.url, { allowData: true }))}" download target="_blank" rel="noopener">${inner}</a>`
                        : html`<div role="button" tabindex="0" class="file ${clickable ? 'clickable' : ''}" @click="${(e: Event) => this.clickFile(file, e)}" @keydown="${onActivate((e: Event) => this.clickFile(file, e))}">${inner}</div>`
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
