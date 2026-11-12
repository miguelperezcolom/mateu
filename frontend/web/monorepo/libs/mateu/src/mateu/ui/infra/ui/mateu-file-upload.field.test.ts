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

    describe('upload mode (the server gave the field a ticket)', () => {
        const ticketed = (extra: { key: string, value: string }[] = []) => [
            { key: 'uploadUrl', value: '/mateu/v3/upload' },
            { key: 'uploadTicket', value: 'T1' },
            ...extra,
        ]

        /** A scripted XMLHttpRequest: records each request; the test answers it. */
        class FakeXhr {
            static sent: FakeXhr[] = []
            method = ''
            url = ''
            headers: Record<string, string> = {}
            body: unknown
            status = 0
            responseText = ''
            upload: { onprogress?: (e: any) => void } = {}
            onload?: () => void
            onerror?: () => void
            onabort?: () => void
            open(method: string, url: string) { this.method = method; this.url = url }
            setRequestHeader(k: string, v: string) { this.headers[k] = v }
            send(body: unknown) { this.body = body; FakeXhr.sent.push(this) }
            abort() { this.onabort?.() }
            answer(status: number, text: string) { this.status = status; this.responseText = text; this.onload?.() }
        }

        afterEach(() => { vi.unstubAllGlobals(); FakeXhr.sent = [] })

        const pick = (root: ShadowRoot, files: File[]) => {
            const input = root.querySelector('input[type=file]') as HTMLInputElement
            Object.defineProperty(input, 'files', { value: files, configurable: true })
            input.dispatchEvent(new Event('change'))
        }

        it('streams the file with its ticket, shows progress and commits the stored reference', async () => {
            vi.stubGlobal('XMLHttpRequest', FakeXhr)
            const { el, root, changes } = await mount({ fieldAttributes: ticketed() })
            pick(root, [new File(['%PDF'], 'big report.pdf', { type: 'application/pdf' })])
            await vi.waitFor(() => expect(FakeXhr.sent).toHaveLength(1))
            const xhr = FakeXhr.sent[0]
            expect(xhr.method).toBe('POST')
            expect(xhr.url).toBe('/mateu/v3/upload')
            expect(xhr.headers['X-Mateu-Upload-Ticket']).toBe('T1')
            expect(xhr.headers['X-Mateu-File-Name']).toBe('big%20report.pdf')
            expect(xhr.headers['Content-Type']).toBe('application/pdf')
            expect(xhr.body).toBeInstanceOf(File)
            xhr.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 4 })
            await el.updateComplete
            expect((root.querySelector('progress') as HTMLProgressElement).value).toBe(0.25)
            xhr.answer(200, '{"value":"mateu-file:f1?name=big%20report.pdf&size=4"}')
            await vi.waitFor(() => expect(changes).toHaveLength(1))
            expect(changes[0]).toEqual({ value: 'mateu-file:f1?name=big%20report.pdf&size=4', fieldId: 'doc' })
            await el.updateComplete
            expect(root.querySelector('progress')).toBeNull()
            expect(root.querySelector('.file')!.textContent).toContain('big report.pdf · 4 bytes')
        })

        it('cancels an upload without committing or complaining', async () => {
            vi.stubGlobal('XMLHttpRequest', FakeXhr)
            const { el, root, changes } = await mount({ fieldAttributes: ticketed() })
            pick(root, [new File(['x'], 'a.pdf', { type: 'application/pdf' })])
            await vi.waitFor(() => expect(FakeXhr.sent).toHaveLength(1))
            await el.updateComplete
            const cancel = [...root.querySelectorAll('button')].find(b => b.textContent!.trim() == 'Cancel')!
            cancel.click()
            await vi.waitFor(() => expect(root.querySelector('progress')).toBeNull())
            expect(changes).toEqual([])
            expect(root.querySelector('[role=alert]')).toBeNull()
        })

        it("shows the server's refusal", async () => {
            vi.stubGlobal('XMLHttpRequest', FakeXhr)
            const { el, root, changes } = await mount({ fieldAttributes: ticketed() })
            pick(root, [new File(['x'], 'a.pdf', { type: 'application/pdf' })])
            await vi.waitFor(() => expect(FakeXhr.sent).toHaveLength(1))
            FakeXhr.sent[0].answer(413, '{"error":"Too large","message":"This file is too large (max 1 MB)."}')
            await vi.waitFor(() => expect(root.querySelector('[role=alert]')).not.toBeNull())
            await el.updateComplete
            expect(root.querySelector('[role=alert]')!.textContent).toBe('This file is too large (max 1 MB).')
            expect(changes).toEqual([])
        })

        it('refuses a file over the declared maxBytes before sending it', async () => {
            vi.stubGlobal('XMLHttpRequest', FakeXhr)
            const { el, root } = await mount({ fieldAttributes: ticketed([{ key: 'maxBytes', value: '2' }]) })
            pick(root, [new File(['xyz'], 'a.pdf', { type: 'application/pdf' })])
            await el.updateComplete
            expect(FakeXhr.sent).toHaveLength(0)
            expect(root.querySelector('[role=alert]')!.textContent).toBe('This file is too large (max 2 bytes).')
        })

        it('uploads several files on a multiple field and removes one entry', async () => {
            vi.stubGlobal('XMLHttpRequest', FakeXhr)
            const { el, root, changes } = await mount({
                fieldAttributes: ticketed([{ key: 'multiple', value: 'true' }]),
                value: ['mateu-file:old?name=old.pdf'],
            })
            expect(root.querySelector('input[type=file]')!.hasAttribute('multiple')).toBe(true)
            pick(root, [new File(['a'], 'a.pdf'), new File(['b'], 'b.pdf')])
            await vi.waitFor(() => expect(FakeXhr.sent).toHaveLength(2))
            FakeXhr.sent[0].answer(200, '{"value":"mateu-file:a?name=a.pdf"}')
            await vi.waitFor(() => expect(changes).toHaveLength(1))
            FakeXhr.sent[1].answer(200, '{"value":"mateu-file:b?name=b.pdf"}')
            await vi.waitFor(() => expect(changes).toHaveLength(2))
            expect(changes[1].value).toEqual(['mateu-file:old?name=old.pdf', 'mateu-file:a?name=a.pdf', 'mateu-file:b?name=b.pdf'])
            await el.updateComplete
            const removes = [...root.querySelectorAll('button')].filter(b => b.textContent!.trim() == 'Remove')
            expect(removes).toHaveLength(3)
            removes[0].click()
            expect(changes[2].value).toEqual(['mateu-file:a?name=a.pdf', 'mateu-file:b?name=b.pdf'])
        })
    })

    it('without a ticket refuses a file over the 10 MB data-URI limit', async () => {
        const { el, root, changes } = await mount()
        const input = root.querySelector('input[type=file]') as HTMLInputElement
        const big = new File(['x'], 'huge.bin')
        Object.defineProperty(big, 'size', { value: 10485761 })
        Object.defineProperty(input, 'files', { value: [big], configurable: true })
        input.dispatchEvent(new Event('change'))
        await el.updateComplete
        expect(root.querySelector('[role=alert]')!.textContent).toBe('This file is too large (max 10 MB).')
        expect(changes).toEqual([])
    })

    it('shows a stored reference by its name and size, linking an http url', async () => {
        const { root } = await mount({ editable: false, value: 'mateu-file:f1?name=a.pdf&size=2048&url=https%3A%2F%2Fcdn.test%2Ff1' })
        const link = root.querySelector('a')!
        expect(link.textContent).toBe('a.pdf · 2 KB')
        expect(link.getAttribute('href')).toBe('https://cdn.test/f1')
    })
})
