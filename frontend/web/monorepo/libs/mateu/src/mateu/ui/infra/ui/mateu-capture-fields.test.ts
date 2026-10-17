// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './mateu-signature-pad'
import './mateu-camera-capture'
import type { MateuSignaturePad } from './mateu-signature-pad'
import type { MateuCameraCapture } from './mateu-camera-capture'

const ctx = () => ({ beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), clearRect: vi.fn(), drawImage: vi.fn() })
let context: ReturnType<typeof ctx>

beforeEach(() => {
    context = ctx()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => context as any)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation((type?: string) => `data:${type};base64,AAA`)
    ;(HTMLCanvasElement.prototype as any).setPointerCapture = vi.fn()
    ;(HTMLCanvasElement.prototype as any).releasePointerCapture = vi.fn()
})
afterEach(() => {
    vi.restoreAllMocks()
    delete (HTMLCanvasElement.prototype as any).setPointerCapture
    delete (HTMLCanvasElement.prototype as any).releasePointerCapture
    document.body.innerHTML = ''
})

const pointer = (type: string, x: number, y: number) => {
    const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true })
    Object.defineProperty(e, 'pointerId', { value: 1 })
    return e
}
const buttons = (el: HTMLElement) => [...el.shadowRoot!.querySelectorAll('button')] as HTMLButtonElement[]
const byText = (el: HTMLElement, text: string) => buttons(el).find(b => b.textContent!.trim() === text)!

async function mount<T extends HTMLElement>(tag: string, props: Record<string, unknown> = {}) {
    const el = document.createElement(tag) as T & { updateComplete: Promise<boolean> }
    Object.assign(el, { fieldId: 'sig', ...props })
    const changes: any[] = []
    el.addEventListener('value-changed', e => changes.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, changes }
}

describe('signature pad', () => {
    it('starts as an empty pad whose Accept stays disabled until something is drawn', async () => {
        const { el, changes } = await mount<MateuSignaturePad>('mateu-signature-pad')
        expect(el.shadowRoot!.querySelector('canvas')).toBeTruthy()
        const accept = byText(el, 'Accept')
        expect(accept.disabled).toBe(true)
        accept.click()
        expect(changes).toHaveLength(0)
        // no Cancel when there is no previous signature to go back to
        expect(buttons(el).map(b => b.textContent!.trim())).toEqual(['Clear', 'Accept'])
    })

    it('draws strokes and accepts them as a PNG data URI', async () => {
        const { el, changes } = await mount<MateuSignaturePad>('mateu-signature-pad')
        const canvas = el.shadowRoot!.querySelector('canvas')!
        canvas.dispatchEvent(pointer('pointermove', 5, 5)) // not drawing yet: ignored
        expect(context.lineTo).not.toHaveBeenCalled()
        canvas.dispatchEvent(pointer('pointerdown', 10, 10))
        canvas.dispatchEvent(pointer('pointermove', 20, 25))
        canvas.dispatchEvent(pointer('pointerup', 20, 25))
        expect(context.moveTo).toHaveBeenCalledWith(10, 10)
        expect(context.lineTo).toHaveBeenCalledWith(20, 25)
        await el.updateComplete
        const accept = byText(el, 'Accept')
        expect(accept.disabled).toBe(false)
        accept.click()
        expect(changes).toEqual([{ value: 'data:image/png;base64,AAA', fieldId: 'sig' }])
    })

    it('Clear wipes the strokes and disables Accept again', async () => {
        const { el } = await mount<MateuSignaturePad>('mateu-signature-pad')
        const canvas = el.shadowRoot!.querySelector('canvas')!
        canvas.dispatchEvent(pointer('pointerdown', 1, 1))
        canvas.dispatchEvent(pointer('pointermove', 2, 2))
        await el.updateComplete
        byText(el, 'Clear').click()
        await el.updateComplete
        expect(context.clearRect).toHaveBeenCalled()
        expect(byText(el, 'Accept').disabled).toBe(true)
    })

    it('shows an existing signature with Sign again / Delete', async () => {
        const { el, changes } = await mount<MateuSignaturePad>('mateu-signature-pad', { value: 'data:image/png;base64,OLD' })
        expect(el.shadowRoot!.querySelector('img')!.getAttribute('src')).toBe('data:image/png;base64,OLD')
        byText(el, 'Delete').click()
        expect(changes).toEqual([{ value: '', fieldId: 'sig' }])

        byText(el, 'Sign again').click()
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('canvas')).toBeTruthy()
        // with a previous value the pad offers Cancel, which goes back to the image
        byText(el, 'Cancel').click()
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('img')).toBeTruthy()
    })
})

describe('camera capture', () => {
    const originalMediaDevices = (navigator as any).mediaDevices
    afterEach(() => { Object.defineProperty(navigator, 'mediaDevices', { value: originalMediaDevices, configurable: true }) })
    const stubCamera = (impl: () => Promise<unknown>) =>
        Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: vi.fn(impl) }, configurable: true })

    it('offers "Take photo" over a placeholder when there is no photo', async () => {
        const { el } = await mount<MateuCameraCapture>('mateu-camera-capture')
        expect(el.shadowRoot!.querySelector('.placeholder')).toBeTruthy()
        expect(buttons(el).map(b => b.textContent!.trim())).toEqual(['Take photo'])
    })

    it('shows an existing photo with Retake and Delete', async () => {
        const { el, changes } = await mount<MateuCameraCapture>('mateu-camera-capture', { value: 'data:image/jpeg;base64,P' })
        expect(el.shadowRoot!.querySelector('img')!.getAttribute('src')).toBe('data:image/jpeg;base64,P')
        expect(byText(el, 'Retake')).toBeTruthy()
        byText(el, 'Delete').click()
        expect(changes).toEqual([{ value: '', fieldId: 'sig' }])
    })

    it('opens the live preview, shoots a JPEG and stops the camera', async () => {
        const stop = vi.fn()
        const stream = { getTracks: () => [{ stop }] }
        stubCamera(() => Promise.resolve(stream))
        vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
        const { el, changes } = await mount<MateuCameraCapture>('mateu-camera-capture')
        byText(el, 'Take photo').click()
        await vi.waitFor(() => expect(el.shadowRoot!.querySelector('video')).toBeTruthy())
        const video = el.shadowRoot!.querySelector('video')!
        await vi.waitFor(() => expect(video.srcObject).toBe(stream))
        expect((navigator as any).mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'environment' }, audio: false })
        Object.defineProperty(video, 'videoWidth', { value: 640 })
        Object.defineProperty(video, 'videoHeight', { value: 480 })
        byText(el, 'Capture').click()
        expect(context.drawImage).toHaveBeenCalled()
        expect(stop).toHaveBeenCalled()
        expect(changes).toEqual([{ value: 'data:image/jpeg;base64,AAA', fieldId: 'sig' }])
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('video')).toBeNull()
    })

    it('does not shoot before the video has a frame, and Cancel closes the camera', async () => {
        const stop = vi.fn()
        stubCamera(() => Promise.resolve({ getTracks: () => [{ stop }] }))
        vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
        const { el, changes } = await mount<MateuCameraCapture>('mateu-camera-capture')
        byText(el, 'Take photo').click()
        await vi.waitFor(() => expect(el.shadowRoot!.querySelector('video')).toBeTruthy())
        byText(el, 'Capture').click()
        expect(changes).toHaveLength(0)
        byText(el, 'Cancel').click()
        await el.updateComplete
        expect(stop).toHaveBeenCalled()
        expect(el.shadowRoot!.querySelector('video')).toBeNull()
    })

    it('stops the stream when removed from the page', async () => {
        const stop = vi.fn()
        stubCamera(() => Promise.resolve({ getTracks: () => [{ stop }] }))
        vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
        const { el } = await mount<MateuCameraCapture>('mateu-camera-capture')
        byText(el, 'Take photo').click()
        await vi.waitFor(() => expect(el.shadowRoot!.querySelector('video')).toBeTruthy())
        el.remove()
        expect(stop).toHaveBeenCalled()
    })

    it('falls back to the file input when the camera is unavailable, reading the picked file as a data URI', async () => {
        stubCamera(() => Promise.reject(new Error('NotAllowedError')))
        const { el, changes } = await mount<MateuCameraCapture>('mateu-camera-capture')
        byText(el, 'Take photo').click()
        await vi.waitFor(() => expect(el.shadowRoot!.querySelector('.error-hint')).toBeTruthy())
        const input = el.shadowRoot!.querySelector('input[type=file]') as HTMLInputElement
        expect(input.getAttribute('capture')).toBe('environment')
        const click = vi.spyOn(input, 'click').mockImplementation(() => {})
        byText(el, 'Use file / native camera').click()
        expect(click).toHaveBeenCalled()

        const file = new File(['hello'], 'p.png', { type: 'image/png' })
        Object.defineProperty(input, 'files', { value: [file], configurable: true })
        input.dispatchEvent(new Event('change'))
        await vi.waitFor(() => expect(changes).toHaveLength(1))
        expect(changes[0]).toEqual({ value: 'data:image/png;base64,aGVsbG8=', fieldId: 'sig' })
    })
})
