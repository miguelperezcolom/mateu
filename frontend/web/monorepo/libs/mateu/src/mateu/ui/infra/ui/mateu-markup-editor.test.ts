// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-markup-editor'
import type { MateuMarkupEditor } from './mateu-markup-editor'

/**
 * An editable markdown/html field: the source is editable and a toggle shows the rendered preview
 * (owner, 2026-10-12). Vaadin used to show only the rendered content (not editable), Redwood only
 * the raw source.
 */
describe('mateu-markup-editor', () => {
    afterEach(() => { document.body.innerHTML = '' })

    const mount = async () => {
        const el = document.createElement('mateu-markup-editor') as MateuMarkupEditor
        el.value = '# Title'
        const preview = document.createElement('div')
        preview.slot = 'preview'
        preview.textContent = 'rendered'
        el.appendChild(preview)
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }

    it('edits the source and announces every change', async () => {
        const el = await mount()
        const seen: unknown[] = []
        el.addEventListener('value-changed', (e) => seen.push((e as CustomEvent).detail.value))
        const textarea = el.shadowRoot!.querySelector('textarea')!
        expect(textarea.value).toBe('# Title')
        textarea.value = '# Other'
        textarea.dispatchEvent(new Event('input'))
        expect(seen).toEqual(['# Other'])
    })

    it('the toggle swaps the source for the rendered preview and back', async () => {
        const el = await mount()
        const toggle = el.shadowRoot!.querySelector('button')!
        expect(toggle.textContent).toBe('Preview')
        toggle.click()
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('textarea')).toBeNull()
        expect(el.shadowRoot!.querySelector('slot[name="preview"]')).not.toBeNull()
        expect(toggle.getAttribute('aria-pressed')).toBe('true')
        expect(toggle.textContent).toBe('Edit')
        toggle.click()
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('textarea')).not.toBeNull()
    })
})
