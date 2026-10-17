// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-file-upload'
import { fieldAttribute, MateuFileUpload } from './mateu-file-upload'

afterEach(() => { document.body.innerHTML = '' })

async function mount(props: Partial<MateuFileUpload> = {}) {
    const el = document.createElement('mateu-file-upload') as MateuFileUpload
    Object.assign(el, { fieldId: 'doc', ...props })
    const changes: any[] = []
    el.addEventListener('value-changed', e => changes.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, changes, root: el.shadowRoot! }
}
const buttonTexts = (root: ShadowRoot) => [...root.querySelectorAll('button')].map(b => b.textContent!.trim())

describe('file upload field', () => {
    it('names the file from the data-URI name parameter, a URL segment or a fallback', () => {
        expect(MateuFileUpload.fileName(undefined)).toBe('')
        expect(MateuFileUpload.fileName('data:application/pdf;name=Factura%20%231.pdf;base64,AA')).toBe('Factura #1.pdf')
        expect(MateuFileUpload.fileName('data:application/pdf;base64,AA')).toBe('Attached file')
        expect(MateuFileUpload.fileName('https://x.test/files/report.csv')).toBe('report.csv')
    })

    it('reads a field attribute from a pair list or a plain map', () => {
        expect(fieldAttribute([{ key: 'accept', value: '.pdf' }], 'accept')).toBe('.pdf')
        expect(fieldAttribute([{ key: 'other', value: 1 }], 'accept')).toBeUndefined()
        expect(fieldAttribute({ accept: 'image/*' }, 'accept')).toBe('image/*')
        expect(fieldAttribute(undefined, 'accept')).toBeUndefined()
    })

    it('offers Choose file when empty and forwards accept to the input', async () => {
        const { root } = await mount({ accept: '.pdf' })
        expect(buttonTexts(root)).toEqual(['Choose file'])
        expect(root.querySelector('input[type=file]')!.getAttribute('accept')).toBe('.pdf')
    })

    it('opens the picker and commits the picked file as a data URI carrying its name', async () => {
        const { root, changes } = await mount()
        const input = root.querySelector('input[type=file]') as HTMLInputElement
        const click = vi.spyOn(input, 'click').mockImplementation(() => {})
        root.querySelector('button')!.click()
        expect(click).toHaveBeenCalled()
        const file = new File(['hi'], 'my notes.txt', { type: 'text/plain' })
        Object.defineProperty(input, 'files', { value: [file], configurable: true })
        input.dispatchEvent(new Event('change'))
        await vi.waitFor(() => expect(changes).toHaveLength(1))
        expect(changes[0]).toEqual({ value: 'data:text/plain;name=my%20notes.txt;base64,aGk=', fieldId: 'doc' })
    })

    it('shows an attached data-URI file as a download link with Replace and Remove', async () => {
        const value = 'data:text/plain;name=a.txt;base64,aGk='
        const { root, changes } = await mount({ value })
        const link = root.querySelector('a')!
        expect(link.textContent).toBe('a.txt')
        expect(link.getAttribute('download')).toBe('a.txt')
        expect(link.getAttribute('href')).toBe(value)
        expect(buttonTexts(root)).toEqual(['Replace', 'Remove'])
        ;[...root.querySelectorAll('button')][1].click()
        expect(changes).toEqual([{ value: '', fieldId: 'doc' }])
    })

    it('shows a URL value as a link opening in a new tab', async () => {
        const { root } = await mount({ value: 'https://x.test/r.pdf' })
        const link = root.querySelector('a')!
        expect(link.getAttribute('target')).toBe('_blank')
        expect(link.getAttribute('href')).toBe('https://x.test/r.pdf')
    })

    it('read-only shows only the name, or a dash when empty', async () => {
        const empty = await mount({ editable: false })
        expect(empty.root.querySelector('.empty')!.textContent).toBe('—')
        expect(empty.root.querySelector('button')).toBeNull()
        const filled = await mount({ editable: false, value: 'https://x.test/r.pdf' })
        expect(filled.root.querySelector('a')!.textContent).toBe('r.pdf')
        expect(filled.root.querySelector('button')).toBeNull()
    })
})
