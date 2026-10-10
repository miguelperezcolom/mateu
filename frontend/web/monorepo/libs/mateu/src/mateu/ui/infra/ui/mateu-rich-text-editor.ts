import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, query, state } from 'lit/decorators.js';
import type { Editor } from "@tiptap/core";
import { richTextHtml } from "./richTextValue";
import { chromeText, type ChromeTextKey } from '@infra/ui/chromeTexts.ts'

type Mark = { id: string, label: ChromeTextKey, glyph: string, active: (e: Editor) => boolean, run: (e: Editor) => void }

const MARKS: Mark[] = [
    { id: 'bold', label: 'bold', glyph: 'B', active: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
    { id: 'italic', label: 'italic', glyph: 'I', active: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
    { id: 'underline', label: 'underline', glyph: 'U', active: (e) => e.isActive('underline'), run: (e) => e.chain().focus().toggleUnderline().run() },
    { id: 'strike', label: 'strikethrough', glyph: 'S', active: (e) => e.isActive('strike'), run: (e) => e.chain().focus().toggleStrike().run() },
    { id: 'h2', label: 'heading', glyph: 'H', active: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
    { id: 'bullet', label: 'bulletedList', glyph: '•', active: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
    { id: 'ordered', label: 'numberedList', glyph: '1.', active: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
    { id: 'quote', label: 'quote', glyph: '❝', active: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
    { id: 'code', label: 'codeBlock', glyph: '</>', active: (e) => e.isActive('codeBlock'), run: (e) => e.chain().focus().toggleCodeBlock().run() },
]

/**
 * <mateu-rich-text-editor> — the editable `richText` field, on Tiptap / ProseMirror (MIT).
 *
 * Replaces vaadin-rich-text-editor, which is under Vaadin's commercial licence. ProseMirror is used
 * rather than Quill because it handles a shadow root (this element always lives in one — inside
 * mateu-field): Quill lost the caret there. The VALUE is HTML — what read-only rich text, Redwood
 * and anything downstream can show; a legacy value in Quill's Delta JSON (what the Vaadin editor
 * used to store) is converted when it opens (richTextHtml) and saved as HTML on the next edit. The
 * editor is lazy-loaded, so it stays out of the initial bundle.
 *
 * Fires `value-changed` with `detail.value` (HTML, '' when empty), like the Vaadin fields.
 */
@customElement('mateu-rich-text-editor')
export class MateuRichTextEditor extends LitElement {

    @property()
    value: string | undefined

    @property({ type: Number })
    maxlength: number | undefined

    @property({ type: Boolean })
    readonly = false

    @property({ type: Boolean })
    autofocus = false

    @property()
    label: string | undefined

    @query('#editor')
    private editorElement!: HTMLDivElement

    /** Bumped on every transaction so the toolbar re-renders its pressed states. */
    @state()
    private tick = 0

    private editor: Editor | undefined
    private lastEmitted: string | undefined

    protected async firstUpdated() {
        const [{ Editor }, { default: StarterKit }] = await Promise.all([
            import("@tiptap/core"),
            import("@tiptap/starter-kit"),
        ])
        if (!this.isConnected) return
        this.editor = new Editor({
            element: this.editorElement,
            // the default stylesheet goes to document.head, which a shadow root never sees
            injectCSS: false,
            extensions: [StarterKit.configure({ link: { openOnClick: false } })],
            content: richTextHtml(this.value),
            editable: !this.readonly,
            autofocus: this.autofocus,
            editorProps: { attributes: { 'aria-label': this.label ?? 'Rich text', role: 'textbox', 'aria-multiline': 'true' } },
            onTransaction: () => { this.tick++ },
            onUpdate: ({ editor }) => {
                if (this.maxlength && editor.state.doc.textContent.length > this.maxlength) {
                    editor.commands.undo()
                    return
                }
                const value = editor.isEmpty ? '' : editor.getHTML()
                this.lastEmitted = value
                this.dispatchEvent(new CustomEvent('value-changed', { detail: { value }, bubbles: true, composed: true }))
            },
        })
        this.lastEmitted = this.value ?? ''
    }

    protected updated(changed: PropertyValues) {
        super.updated(changed)
        if (!this.editor) return
        if (changed.has('readonly')) this.editor.setEditable(!this.readonly)
        // an outside change (a reset, a server-sent state), not the echo of our own edit
        if (changed.has('value') && (this.value ?? '') !== (this.lastEmitted ?? '')) {
            this.editor.commands.setContent(richTextHtml(this.value), { emitUpdate: false })
            this.lastEmitted = this.value ?? ''
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.editor?.destroy()
        this.editor = undefined
    }

    private link() {
        if (!this.editor) return
        const current = this.editor.getAttributes('link').href as string | undefined
        const href = window.prompt(chromeText('linkAddress'), current ?? 'https://')
        if (href === null) return
        if (!href.trim()) this.editor.chain().focus().unsetLink().run()
        else if (/^(https?:|mailto:|\/)/i.test(href.trim())) this.editor.chain().focus().setLink({ href: href.trim() }).run()
    }

    render() {
        void this.tick
        const e = this.editor
        return html`
            <div class="frame">
                ${this.readonly ? nothing : html`
                    <div class="toolbar" role="toolbar" aria-label="${chromeText('formatting')}">
                        ${MARKS.map((m) => html`
                            <button type="button" class="tool tool-${m.id}" title="${chromeText(m.label)}" aria-label="${chromeText(m.label)}"
                                    aria-pressed="${e ? String(m.active(e)) : 'false'}" ?disabled=${!e}
                                    @mousedown=${(ev: Event) => ev.preventDefault()}
                                    @click=${() => e && m.run(e)}>${m.glyph}</button>`)}
                        <button type="button" class="tool" title="${chromeText('link')}" aria-label="${chromeText('link')}" ?disabled=${!e}
                                aria-pressed="${e ? String(e.isActive('link')) : 'false'}"
                                @mousedown=${(ev: Event) => ev.preventDefault()} @click=${() => this.link()}>🔗</button>
                    </div>`}
                <div id="editor"></div>
            </div>`
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-family: var(--lumo-font-family, inherit);
            color: var(--lumo-body-text-color, inherit);
        }
        .frame {
            border: 1px solid var(--lumo-contrast-20pct, #d0d4d9);
            border-radius: var(--lumo-border-radius-m, 4px);
            background: var(--lumo-base-color, #fff);
        }
        .frame:focus-within { border-color: var(--lumo-primary-color, #1676f3); }
        .toolbar {
            display: flex; flex-wrap: wrap; gap: 2px; padding: 4px;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e6e8eb);
        }
        .tool {
            min-width: 2rem; height: 2rem; padding: 0 .4rem; border: 0; border-radius: 4px;
            background: transparent; color: inherit; font: inherit; font-weight: 600; cursor: pointer;
        }
        .tool-italic { font-style: italic; }
        .tool-underline { text-decoration: underline; }
        .tool-strike { text-decoration: line-through; }
        .tool:hover { background: var(--lumo-contrast-5pct, #f1f3f5); }
        .tool[aria-pressed="true"] { background: var(--lumo-primary-color-10pct, #e3eefc); color: var(--lumo-primary-text-color, #1676f3); }
        .tool:focus-visible { outline: 2px solid var(--lumo-primary-color, #1676f3); outline-offset: 1px; }
        #editor { padding: 0 .75rem; }
        /* ProseMirror's own required styles (Tiptap injects them into document.head, out of reach) */
        .ProseMirror { min-height: 7rem; padding: .5rem 0; outline: none; white-space: pre-wrap; word-wrap: break-word; }
        .ProseMirror p { margin: .25rem 0; }
        .ProseMirror blockquote { margin: .25rem 0; padding-left: .75rem; border-left: 3px solid var(--lumo-contrast-20pct, #d0d4d9); }
        .ProseMirror pre { background: var(--lumo-contrast-5pct, #f1f3f5); padding: .5rem; border-radius: 4px; }
        .ProseMirror a { color: var(--lumo-primary-text-color, #1676f3); }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-rich-text-editor': MateuRichTextEditor
    }
}
