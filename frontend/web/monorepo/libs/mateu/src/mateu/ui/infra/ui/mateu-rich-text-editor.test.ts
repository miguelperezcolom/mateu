// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './mateu-rich-text-editor'
import type { MateuRichTextEditor } from './mateu-rich-text-editor'

// ProseMirror's shadow-root selection probe calls document.execCommand, which jsdom lacks
beforeEach(() => { (document as any).execCommand = () => false })
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); delete (document as any).execCommand })

async function mount(props: Record<string, unknown> = {}) {
    const el = document.createElement('mateu-rich-text-editor') as MateuRichTextEditor
    Object.assign(el, props)
    const changes: string[] = []
    el.addEventListener('value-changed', e => changes.push((e as CustomEvent).detail.value))
    document.body.appendChild(el)
    await el.updateComplete
    const root = el.shadowRoot!
    // Tiptap is lazy-loaded: wait until the toolbar is enabled (the editor exists)
    await vi.waitFor(() => expect(root.querySelector('.ProseMirror')).toBeTruthy(), { timeout: 3000 })
    await el.updateComplete
    return { el, root, changes, editor: () => (el as any).editor }
}

describe('rich text editor', () => {
    it('opens on the HTML value, labelled for screen readers', async () => {
        const { root } = await mount({ value: '<p>Hello <strong>world</strong></p>', label: 'Notes' })
        const pm = root.querySelector('.ProseMirror')!
        expect(pm.innerHTML).toContain('<strong>world</strong>')
        expect(pm.getAttribute('aria-label')).toBe('Notes')
        expect(pm.getAttribute('role')).toBe('textbox')
        expect(root.querySelector('[role=toolbar]')!.querySelectorAll('button')).toHaveLength(10)
        expect((root.querySelector('.tool-bold') as HTMLButtonElement).disabled).toBe(false)
    })

    it('converts a legacy Quill Delta value to HTML when it opens', async () => {
        const { root } = await mount({ value: JSON.stringify([{ insert: 'Legacy', attributes: { bold: true } }, { insert: '\n' }]) })
        expect(root.querySelector('.ProseMirror')!.innerHTML).toContain('<strong>Legacy</strong>')
    })

    it('emits HTML on every edit, and an empty string when cleared', async () => {
        const { editor, changes } = await mount({ value: '<p>a</p>' })
        editor().commands.setContent('<p>b</p>', { emitUpdate: true })
        expect(changes.at(-1)).toBe('<p>b</p>')
        editor().commands.clearContent(true)
        expect(changes.at(-1)).toBe('')
    })

    it('toolbar buttons toggle marks and show their pressed state', async () => {
        const { el, root, editor, changes } = await mount({ value: '<p>text</p>' })
        editor().commands.selectAll()
        ;(root.querySelector('.tool-bold') as HTMLButtonElement).click()
        await el.updateComplete
        expect(changes.at(-1)).toBe('<p><strong>text</strong></p>')
        expect(root.querySelector('.tool-bold')!.getAttribute('aria-pressed')).toBe('true')
        for (const id of ['italic', 'underline', 'strike', 'h2', 'bullet', 'ordered', 'quote', 'code']) {
            (root.querySelector(`.tool-${id}`) as HTMLButtonElement).click()
        }
        await el.updateComplete
        expect(changes.length).toBeGreaterThan(3)
    })

    it('refuses an edit beyond maxlength', async () => {
        const { editor, changes } = await mount({ value: '<p>abc</p>', maxlength: 5 })
        editor().commands.insertContentAt(4, 'defghij')
        expect(editor().state.doc.textContent).toBe('abc')
        // the refused edit never reaches the field: whatever is emitted is the restored value
        expect(changes.every(v => v === '<p>abc</p>')).toBe(true)
    })

    it('takes an outside value change without echoing it back', async () => {
        const { el, root, changes } = await mount({ value: '<p>one</p>' })
        el.value = '<p>two</p>'
        await el.updateComplete
        expect(root.querySelector('.ProseMirror')!.textContent).toBe('two')
        expect(changes).toHaveLength(0)
    })

    it('read-only hides the toolbar and stops editing; flipping it back re-enables', async () => {
        const { el, root, editor } = await mount({ value: '<p>x</p>', readonly: true })
        expect(root.querySelector('[role=toolbar]')).toBeNull()
        expect(editor().isEditable).toBe(false)
        el.readonly = false
        await el.updateComplete
        expect(editor().isEditable).toBe(true)
    })

    it('the link button sets a safe link, removes it on blank and ignores unsafe schemes', async () => {
        const { root, editor } = await mount({ value: '<p>site</p>' })
        editor().commands.selectAll()
        const linkButton = [...root.querySelectorAll('button')].at(-1) as HTMLButtonElement
        const prompt = vi.spyOn(window, 'prompt')
        prompt.mockReturnValueOnce('javascript:alert(1)')
        linkButton.click()
        expect(editor().getHTML()).not.toContain('href')
        prompt.mockReturnValueOnce('https://mateu.io')
        linkButton.click()
        expect(editor().getHTML()).toContain('href="https://mateu.io"')
        prompt.mockReturnValueOnce(null)
        linkButton.click()
        expect(editor().getHTML()).toContain('href="https://mateu.io"')
        prompt.mockReturnValueOnce('  ')
        linkButton.click()
        expect(editor().getHTML()).not.toContain('href')
    })

    it('destroys the editor when removed', async () => {
        const { el, editor } = await mount({ value: '<p>x</p>' })
        const ed = editor()
        el.remove()
        expect(ed.isDestroyed).toBe(true)
    })
})
