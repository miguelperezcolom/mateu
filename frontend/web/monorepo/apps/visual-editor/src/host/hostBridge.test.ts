import { describe, expect, it } from 'vitest'
import { isTrustedHostMessage, type HostWindowLike } from './hostBridge'

const ORIGIN = 'http://localhost:63342'

const topWindow = (): HostWindowLike => {
    const w = { location: { origin: ORIGIN } } as HostWindowLike & { parent: unknown }
    w.parent = w // a top-level window is its own parent
    return w
}

const framedWindow = (hostOrigin?: string): { win: HostWindowLike; parent: object } => {
    const parent = {}
    return { win: { parent, location: { origin: ORIGIN }, __mateuHostOrigin: hostOrigin }, parent }
}

describe('isTrustedHostMessage', () => {
    it('accepts what the JCEF host posts into the page itself (same window, same origin)', () => {
        const win = topWindow()
        expect(isTrustedHostMessage({ source: win, origin: ORIGIN }, win)).toBe(true)
    })

    it('refuses the same window claiming another origin', () => {
        const win = topWindow()
        expect(isTrustedHostMessage({ source: win, origin: 'https://evil.example' }, win)).toBe(false)
    })

    it('refuses messages from other windows: an opener, a sibling iframe, a popup', () => {
        const win = topWindow()
        expect(isTrustedHostMessage({ source: {}, origin: ORIGIN }, win)).toBe(false)
        expect(isTrustedHostMessage({ source: null, origin: ORIGIN }, win)).toBe(false)
        expect(isTrustedHostMessage({ source: {}, origin: 'https://evil.example' }, win)).toBe(false)
    })

    it('accepts the embedding parent frame only from an expected origin', () => {
        const { win, parent } = framedWindow()
        expect(isTrustedHostMessage({ source: parent, origin: 'vscode-webview://abc123' }, win)).toBe(true)
        expect(isTrustedHostMessage({ source: parent, origin: ORIGIN }, win)).toBe(true)
        expect(isTrustedHostMessage({ source: parent, origin: 'https://evil.example' }, win)).toBe(false)
    })

    it('accepts a parent origin the host declared', () => {
        const { win, parent } = framedWindow('https://ide.example')
        expect(isTrustedHostMessage({ source: parent, origin: 'https://ide.example' }, win)).toBe(true)
        expect(isTrustedHostMessage({ source: parent, origin: 'https://other.example' }, win)).toBe(false)
    })
})

describe('MessageHost project files', () => {
    // node env: just enough of `window` for the constructor
    const setup = () => {
        const g = globalThis as unknown as { window?: unknown }
        const previous = g.window
        g.window = { addEventListener: () => {}, location: { origin: ORIGIN } }
        let deliver: (e: { data: unknown }) => void = () => {}
        const posted: unknown[] = []
        const channel = {
            postMessage: (m: unknown) => posted.push(m),
            addEventListener: (_t: string, cb: (e: { data: unknown }) => void) => { deliver = cb },
        }
        // imported lazily so `window` exists when the module's class is constructed
        return { channel, posted, deliver: (d: unknown) => deliver({ data: d }), restore: () => { g.window = previous } }
    }

    it('answers listFiles with the host\'s reply', async () => {
        const { MessageHost } = await import('./hostBridge')
        const t = setup()
        try {
            const host = new MessageHost(t.channel as never)
            const files = host.listFiles()
            t.deliver({ type: 'files', files: [{ path: 'welcome.yaml', content: 'type: VerticalLayout' }] })
            expect(await files).toEqual([{ path: 'welcome.yaml', content: 'type: VerticalLayout' }])
        } finally { t.restore() }
    })

    it('hands files pushed later (a page created while open, a late reply) to onFilesChanged', async () => {
        const { MessageHost } = await import('./hostBridge')
        const t = setup()
        try {
            const host = new MessageHost(t.channel as never)
            const seen: string[][] = []
            host.onFilesChanged((files) => seen.push(files.map((f) => f.path)))
            t.deliver({ type: 'files', files: [{ path: 'welcome.yaml', content: '' }] })
            t.deliver({ type: 'files', files: [{ path: 'welcome.yaml', content: '' }, { path: 'about.yaml', content: '' }] })
            expect(seen).toEqual([['welcome.yaml'], ['welcome.yaml', 'about.yaml']])
        } finally { t.restore() }
    })
})
