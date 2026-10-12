import { describe, expect, it } from 'vitest'
import jsQR from 'jsqr'
import { dataCodewords, encodeQr, qrDataUri, qrSvg, QrCode, QrEcc } from './qrEncoder'
import { currentRoute, mobileAddUrl } from './mobileLink'

/** Rasterises the symbol (quiet zone included) to RGBA pixels, the input jsQR reads. */
const rasterise = (qr: QrCode, scale = 4, border = 4) => {
    const dim = (qr.size + border * 2) * scale
    const data = new Uint8ClampedArray(dim * dim * 4).fill(255)
    for (let y = 0; y < qr.size; y++) {
        for (let x = 0; x < qr.size; x++) {
            if (!qr.modules[y][x]) continue
            for (let dy = 0; dy < scale; dy++) {
                for (let dx = 0; dx < scale; dx++) {
                    const px = ((y + border) * scale + dy) * dim + (x + border) * scale + dx
                    data[px * 4] = data[px * 4 + 1] = data[px * 4 + 2] = 0
                }
            }
        }
    }
    return { data, dim }
}

/** What a real decoder (jsQR, Apache-2.0, a dev dependency only) reads off the symbol. */
export const decode = (qr: QrCode): string | undefined => {
    const { data, dim } = rasterise(qr)
    return jsQR(data, dim, dim)?.data
}

describe('qrEncoder', () => {
    it('version 1-M holds 14 bytes, and the size grows 4 modules per version', () => {
        expect(dataCodewords(1, 'M')).toBe(16)
        expect(encodeQr('a'.repeat(14)).version).toBe(1)
        expect(encodeQr('a'.repeat(15)).version).toBe(2)
        expect(encodeQr('a'.repeat(15)).size).toBe(25)
    })

    it('round-trips through a real decoder at every level', () => {
        for (const ecc of ['L', 'M', 'Q', 'H'] as QrEcc[]) {
            const text = `https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com&ecc=${ecc}`
            expect(decode(encodeQr(text, ecc))).toBe(text)
        }
    })

    it('round-trips across versions, incl. version information (7+) and 16-bit counts (10+)', () => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789/-?&=%'
        for (const length of [1, 10, 30, 60, 100, 150, 220, 300, 400, 600, 1000]) {
            const text = Array.from({ length }, (_, i) => alphabet[(i * 7) % alphabet.length]).join('')
            const qr = encodeQr(text)
            expect(decode(qr), `length ${length} (version ${qr.version})`).toBe(text)
        }
    })

    it('encodes non-ASCII as UTF-8', () => {
        const text = 'https://mateu.io/add?u=https%3A%2F%2Fexample.com — ñ'
        expect(decode(encodeQr(text))).toBe(text)
    })

    it('draws an SVG with a quiet zone, and a data URI for an <img>', () => {
        expect(qrSvg(encodeQr('x'))).toContain('viewBox="0 0 29 29"')
        expect(qrDataUri('x')).toMatch(/^data:image\/svg\+xml;charset=utf-8,%3Csvg/)
    })

    it('refuses what no symbol can hold', () => {
        expect(() => encodeQr('x'.repeat(3000), 'H')).toThrow()
    })
})

describe('mobileAddUrl', () => {
    it('encodes the absolute base URL and the route', () => {
        expect(mobileAddUrl('https://crm.acme.com', '/crm', '/orders/42?tab=lines'))
            .toBe('https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com%2Fcrm&r=%2Forders%2F42%3Ftab%3Dlines')
    })
    it('the root mount is the origin alone, and an empty route is omitted', () => {
        expect(mobileAddUrl('https://crm.acme.com/', '', '/')).toBe('https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com')
        expect(mobileAddUrl('https://crm.acme.com', undefined)).toBe('https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com')
    })
    it('keeps an absolute base URL (a federated app)', () => {
        expect(mobileAddUrl('https://shell.acme.com', 'https://crm.acme.com/crm/'))
            .toBe('https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com%2Fcrm')
    })
    it('the QR of the link decodes back to it', () => {
        const url = mobileAddUrl('https://crm.acme.com', '/crm', '/orders')
        expect(decode(encodeQr(url))).toBe(url)
    })
})

describe('currentRoute', () => {
    it('strips the mount prefix and keeps the query', () => {
        expect(currentRoute('/crm/orders/42', '?x=1', '/crm')).toBe('/orders/42?x=1')
        expect(currentRoute('/crm', '', '/crm')).toBe('')
        expect(currentRoute('/orders', '', '')).toBe('/orders')
        expect(currentRoute('/', '', '')).toBe('')
    })
})
