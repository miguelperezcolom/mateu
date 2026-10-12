// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import jsQR from 'jsqr'
import './mateu-mobile-qr-dialog'
import { MateuMobileQrDialog, openMobileQrDialog } from './mateu-mobile-qr-dialog'

/**
 * Reads the QR back out of what the dialog actually RENDERED: the <img>'s SVG data URI is parsed
 * into modules (one `M x,y h1v1h-1z` square per dark module), rasterised and handed to a real
 * decoder — so the test proves the picture on screen encodes the right link.
 */
const decodeRenderedQr = (img: HTMLImageElement): string | undefined => {
    const svg = decodeURIComponent(img.src.substring(img.src.indexOf(',') + 1))
    const dim = Number(/viewBox="0 0 (\d+) \d+"/.exec(svg)![1])
    const scale = 4
    const size = dim * scale
    const data = new Uint8ClampedArray(size * size * 4).fill(255)
    for (const m of svg.matchAll(/M(\d+),(\d+)h1v1h-1z/g)) {
        const x = Number(m[1])
        const y = Number(m[2])
        for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
                const px = (y * scale + dy) * size + x * scale + dx
                data[px * 4] = data[px * 4 + 1] = data[px * 4 + 2] = 0
            }
        }
    }
    return jsQR(data, size, size)?.data
}

const rendered = async (dialog: MateuMobileQrDialog) => {
    await dialog.updateComplete
    return dialog.shadowRoot!
}

describe('mateu-mobile-qr-dialog', () => {
    afterEach(() => document.querySelectorAll('mateu-mobile-qr-dialog').forEach((d) => d.remove()))

    it('shows a QR that decodes to the add link of this UI and screen', async () => {
        window.history.pushState({}, '', '/crm/orders/42?tab=lines')
        const dialog = openMobileQrDialog({ appTitle: 'Acme CRM', baseUrl: '/crm' })
        dialog.phone = false
        const root = await rendered(dialog)
        const expected = `https://mateu.io/add?u=${encodeURIComponent(window.location.origin + '/crm')}`
            + `&r=${encodeURIComponent('/orders/42?tab=lines')}`
        expect(dialog.url).toBe(expected)
        const img = root.querySelector('img.qr') as HTMLImageElement
        expect(img.alt).toBe('QR code that opens Acme CRM in the Mateu app')
        expect(decodeRenderedQr(img)).toBe(expected)
        expect((root.querySelector('input') as HTMLInputElement).value).toBe(expected)
    })

    it('is a labelled modal dialog that Escape closes', async () => {
        const dialog = openMobileQrDialog({ appTitle: 'Acme CRM', baseUrl: '' })
        const root = await rendered(dialog)
        const panel = root.querySelector('[role="dialog"]')!
        expect(panel.getAttribute('aria-modal')).toBe('true')
        expect(root.getElementById(panel.getAttribute('aria-labelledby')!)!.textContent).toBe('Open Acme CRM on your phone')
        expect(root.querySelector('button.close')!.getAttribute('aria-label')).toBe('Close')
        panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }))
        expect(document.querySelector('mateu-mobile-qr-dialog')).toBeNull()
    })

    it('on a phone offers the link instead of a QR to scan', async () => {
        const dialog = openMobileQrDialog({ appTitle: 'Acme CRM', baseUrl: '' })
        dialog.phone = true
        const root = await rendered(dialog)
        expect(root.querySelector('img.qr')).toBeNull()
        const link = root.querySelector('a.open') as HTMLAnchorElement
        expect(link.textContent).toBe('Open in the Mateu app')
        expect(link.getAttribute('href')).toBe(dialog.url)
    })

    it('one dialog at a time', () => {
        openMobileQrDialog({ appTitle: 'A' })
        openMobileQrDialog({ appTitle: 'B' })
        expect(document.querySelectorAll('mateu-mobile-qr-dialog')).toHaveLength(1)
    })
})
