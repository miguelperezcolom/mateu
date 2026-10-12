import { css } from 'lit'

/**
 * The Properties pane's look, shared by the pane and the editors it hosts (the page header editor),
 * so a nested editor's labels, inputs and pickers line up with the pane's own. Colours come from the
 * editor's `--ve-*` tokens (light + dark, mateu-visual-editor.ts).
 */
export const panelStyles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-surface, #f7f8fa); border-left: 1px solid var(--ve-border, #e3e5e8); }
        .title { padding: 0.6rem 0.75rem; font: 600 12px var(--ve-font, system-ui); color: var(--ve-text, #374151); border-bottom: 1px solid var(--ve-border, #e3e5e8); }
        .empty { padding: 1rem 0.75rem; font: 13px var(--ve-font, system-ui); color: var(--ve-tertiary, #9ca3af); }
        .type { padding: 0.5rem 0.75rem; font: 600 13px var(--ve-font, system-ui); color: var(--ve-text, #111827); }
        .section { padding: 0.15rem 0.75rem 0.1rem; font: 600 10px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .04em; color: var(--ve-tertiary, #9ca3af); margin-top: 0.35rem; }
        label { display: block; padding: 0.25rem 0.75rem 0; font: 11px var(--ve-font, system-ui); color: var(--ve-secondary, #6b7280); }
        label .req { color: var(--ve-error); }
        ve-select { display: block; width: calc(100% - 1.5rem); margin: 0.1rem 0.75rem 0.35rem; box-sizing: border-box;
                font: 13px var(--ve-font, system-ui); --ve-select-radius: 6px; --ve-select-padding: 0.35rem 0.5rem; }
        input { display: block; width: calc(100% - 1.5rem); margin: 0.1rem 0.75rem 0.35rem; padding: 0.35rem 0.5rem;
                font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px; box-sizing: border-box; background: var(--ve-base, #fff); color: inherit; }
        textarea.note { display: block; width: calc(100% - 1.5rem); margin: 0.1rem 0.75rem 0.35rem; padding: 0.35rem 0.5rem; resize: vertical;
                font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-note-border); border-radius: 6px; box-sizing: border-box;
                background: var(--ve-note-bg); color: var(--ve-note-ink); }
        .check { display: flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.75rem 0.35rem; font: 13px var(--ve-font, system-ui); color: var(--ve-text, #374151); }
        .check input { width: auto; margin: 0; }
        .muted { padding: 0.15rem 0.75rem 0.35rem; font: 12px var(--ve-font, system-ui); color: var(--ve-tertiary, #b0b6be); }
        .row { display: flex; gap: 0.4rem; padding: 0.6rem 0.75rem; border-top: 1px solid var(--ve-border, #e3e5e8); margin-top: 0.5rem; }
        .row button { flex: 1; padding: 0.4rem; font: 12px var(--ve-font, system-ui); background: var(--ve-base, #fff); color: inherit; border: 1px solid var(--ve-input-border, #d7dade);
                      border-radius: 6px; cursor: pointer; }
        .row button.danger { color: var(--ve-error, #b00020); border-color: var(--ve-error-border); }
        .add { display: flex; gap: 0.4rem; padding: 0.4rem 0.75rem 0.6rem; }
        .add input { margin: 0; }
        .add button { padding: 0 0.6rem; font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px; background: var(--ve-base, #fff); color: inherit; cursor: pointer; }
        .inline { display: flex; gap: 0.3rem; align-items: center; margin: 0.1rem 0.75rem 0.35rem; }
        ve-image-picker, ve-icon-picker, ve-combo { margin: 0.1rem 0.75rem 0.35rem; }
        .inline input, .inline ve-select, .inline ve-combo { margin: 0; width: auto; flex: 1; min-width: 0; }
        .inline button, .slots button { padding: 0.3rem 0.55rem; font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade);
            border-radius: 6px; background: var(--ve-base, #fff); color: inherit; cursor: pointer; white-space: nowrap; }
        .slots { display: flex; flex-wrap: wrap; gap: 0.3rem; padding: 0.2rem 0.75rem 0.4rem; }
        .help { padding: 0 0.75rem 0.3rem; font: 11px var(--ve-font, system-ui); color: var(--ve-tertiary, #9ca3af); }
        .muted-inline { color: var(--ve-tertiary, #b0b6be); }
        details.more { margin: 0.2rem 0 0.3rem; }
        details.more summary { cursor: pointer; padding: 0.3rem 0.75rem; font: 12px var(--ve-font, system-ui);
            color: var(--ve-primary-text, #1d4ed8); list-style: none; }
        details.more summary::-webkit-details-marker { display: none; }
        details.more summary::before { content: '▸ '; }
        details.more[open] summary::before { content: '▾ '; }
`
