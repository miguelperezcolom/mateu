// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-field'
import type { MateuField } from './mateu-field'

/**
 * The image stereotype (an image by its URL): in an EDITABLE form, the URL input and a contained
 * preview that follows the value — it used to draw only the image, full size, with no way to change
 * it. Read-only (a view, a read-only form) it stays the image alone.
 */
const mount = async (over: Record<string, unknown>, state: Record<string, unknown>) => {
    const el = document.createElement('mateu-field') as MateuField
    el.id = 'photo'
    el.field = { fieldId: 'photo', dataType: 'string', stereotype: 'image', label: 'Photo URL', required: false,
        disabled: false, readOnly: false, ...over } as never
    el.state = state
    el.data = {}
    const changes: { value: unknown }[] = []
    el.addEventListener('value-changed', (e) => changes.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, root: el.shadowRoot!, changes }
}

afterEach(() => { document.body.innerHTML = '' })

describe('an image field', () => {
    it('editable: the URL can be changed, under it a contained preview of the value', async () => {
        const { el, root, changes } = await mount({}, { photo: '/img/a.jpg' })
        const input = root.querySelector('vaadin-text-field.mateu-image-url') as any
        expect(input).not.toBeNull()
        expect(input.value).toBe('/img/a.jpg')
        const preview = root.querySelector('img.mateu-image-preview') as HTMLImageElement
        expect(preview.getAttribute('src')).toBe('/img/a.jpg')
        expect(preview.getAttribute('style')).toContain('max-height: 240px')
        input.dispatchEvent(new CustomEvent('value-changed', { detail: { value: '/img/b.jpg' } }))
        expect(changes.at(-1)?.value).toBe('/img/b.jpg')
        // the preview follows the value
        el.state = { photo: '/img/b.jpg' }
        await el.updateComplete
        expect(root.querySelector('img.mateu-image-preview')!.getAttribute('src')).toBe('/img/b.jpg')
    })

    it('editable and empty: the input, no broken image', async () => {
        const { root } = await mount({}, {})
        expect(root.querySelector('vaadin-text-field.mateu-image-url')).not.toBeNull()
        expect(root.querySelector('img')).toBeNull()
    })

    it('read-only: the image alone', async () => {
        const { root } = await mount({ readOnly: true }, { photo: '/img/a.jpg' })
        expect(root.querySelector('vaadin-text-field')).toBeNull()
        expect(root.querySelector('img')!.getAttribute('src')).toBe('/img/a.jpg')
    })
})
