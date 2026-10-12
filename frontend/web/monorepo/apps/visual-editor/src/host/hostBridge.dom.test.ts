// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageHost, resolveHost } from './hostBridge'
import { encodeShareLink } from '../model/shareLink'

// The editor's side of the host protocol, as the IDE hosts (VS Code webview, IntelliJ JCEF) and the
// standalone browser drive it. The pure trust check has its own suite (hostBridge.test.ts).

function channel() {
    const posted: any[] = []
    let listener: ((e: MessageEvent) => void) | undefined
    return {
        posted,
        postMessage: (m: unknown) => posted.push(m),
        addEventListener: (_: 'message', cb: (e: MessageEvent) => void) => { listener = cb },
        /** A message on the channel itself (VS Code's acquireVsCodeApi channel). */
        send: (data: unknown) => listener?.(new MessageEvent('message', { data })),
    }
}
/** A message posted into the page's own window (how the JCEF host speaks). */
const windowMessage = (data: unknown, init: Partial<MessageEventInit> = {}) =>
    window.dispatchEvent(new MessageEvent('message', { data, origin: location.origin, source: window, ...init }))

beforeEach(() => localStorage.clear())
afterEach(() => {
    vi.useRealTimers()
    delete (window as any).acquireVsCodeApi
    delete (window as any).__mateuHost
    delete (window as any).__mateuBaseUrl
})

describe('MessageHost (IDE hosts)', () => {
    it('says ready, and init seeds the YAML, the backend and the file path', async () => {
        const ch = channel()
        const host = new MessageHost(ch)
        expect(ch.posted).toEqual([{ type: 'ready' }])
        ch.send({ type: 'init', yaml: 'type: Form\n', baseUrl: 'http://127.0.0.1:4711', path: 'orders/list.yaml' })
        expect(await host.initialYaml()).toBe('type: Form\n')
        expect(host.baseUrl()).toBe('http://127.0.0.1:4711')
        expect(host.currentPath()).toBe('orders/list.yaml')
    })

    it('an edit marks the IDE document dirty (contentChanged) — it never saves by itself', () => {
        const ch = channel()
        const host = new MessageHost(ch)
        host.onContentChanged('type: Form\ntitle: B\n')
        expect(ch.posted.at(-1)).toEqual({ type: 'contentChanged', yaml: 'type: Form\ntitle: B\n' })
    })

    it('reads trusted window messages (JCEF) and ignores any other window or origin', async () => {
        const ch = channel()
        const host = new MessageHost(ch)
        const external = vi.fn()
        host.onExternalChange(external)
        windowMessage({ type: 'externalChange', yaml: 'evil' }, { origin: 'https://evil.example' })
        windowMessage({ type: 'externalChange', yaml: 'evil' }, { source: null })
        expect(external).not.toHaveBeenCalled()
        windowMessage({ type: 'externalChange', yaml: 'typed in the text editor' })
        expect(external).toHaveBeenCalledWith('typed in the text editor')
        windowMessage(null)
        windowMessage('not an object')
    })

    it('listFiles resolves with the answer; later pushes reach onFilesChanged', async () => {
        const ch = channel()
        const host = new MessageHost(ch)
        const pushed = vi.fn()
        host.onFilesChanged(pushed)
        const answer = host.listFiles()
        expect(ch.posted.at(-1)).toEqual({ type: 'listFiles' })
        ch.send({ type: 'files', files: [{ path: 'a.yaml', content: 'x' }] })
        expect(await answer).toEqual([{ path: 'a.yaml', content: 'x' }])
        expect(pushed).not.toHaveBeenCalled()
        ch.send({ type: 'files', files: [{ path: 'b.yaml', content: 'y' }] })
        expect(pushed).toHaveBeenCalledWith([{ path: 'b.yaml', content: 'y' }])
        ch.send({ type: 'files', files: 'garbage' })
        expect(pushed).toHaveBeenLastCalledWith([])
    })

    it('a host that never answers listFiles leaves the pickers empty, and the late answer still lands', async () => {
        vi.useFakeTimers()
        const ch = channel()
        const host = new MessageHost(ch)
        const pushed = vi.fn()
        host.onFilesChanged(pushed)
        const answer = host.listFiles()
        await vi.advanceTimersByTimeAsync(1600)
        expect(await answer).toEqual([])
        ch.send({ type: 'files', files: [{ path: 'late.yaml', content: '' }] })
        expect(pushed).toHaveBeenCalledWith([{ path: 'late.yaml', content: '' }])
        // an answered request followed by another within the window: the second gets ITS answer
        const first = host.listFiles()
        ch.send({ type: 'files', files: [] })
        await first
        await vi.advanceTimersByTimeAsync(1000)
        const second = host.listFiles()
        await vi.advanceTimersByTimeAsync(800) // the first request's timer fires in here
        ch.send({ type: 'files', files: [{ path: 'second.yaml', content: '' }] })
        expect(await second).toEqual([{ path: 'second.yaml', content: '' }])
    })

    it('images: list (with a timeout), pushes, and add — whose cancel answers undefined', async () => {
        vi.useFakeTimers()
        const ch = channel()
        const host = new MessageHost(ch)
        const listed = host.listImages()
        ch.send({ type: 'images', images: [{ path: 'img/a.png', url: '/img/a.png', thumb: 't' }, { bogus: true }] })
        expect(await listed).toEqual([{ path: 'img/a.png', url: '/img/a.png', thumb: 't' }])
        const pushed = vi.fn()
        host.onImagesChanged(pushed)
        ch.send({ type: 'images', images: [] })
        expect(pushed).toHaveBeenCalledWith([])
        // a second list shortly after the first was answered: the first's timer must not steal its slot
        await vi.advanceTimersByTimeAsync(2000)
        const slow = host.listImages()
        await vi.advanceTimersByTimeAsync(1500)
        ch.send({ type: 'images', images: [{ url: '/img/c.png', thumb: 'tc' }] })
        expect(await slow).toEqual([{ path: '/img/c.png', url: '/img/c.png', thumb: 'tc' }])
        const unanswered = host.listImages()
        await vi.advanceTimersByTimeAsync(3100)
        expect(await unanswered).toEqual([])

        const first = host.addImage()
        const second = host.addImage() // a second request cancels the first
        expect(await first).toBeUndefined()
        ch.send({ type: 'imageAdded', image: { url: '/img/b.png', thumb: 'tb', src: 'http://127.0.0.1:1/img/b.png' } })
        expect(await second).toEqual({ path: '/img/b.png', url: '/img/b.png', thumb: 'tb', src: 'http://127.0.0.1:1/img/b.png' })
        const cancelled = host.addImage()
        ch.send({ type: 'imageAdded', image: null })
        expect(await cancelled).toBeUndefined()
    })

    it('the board writes only safe mount paths, and opening a file is left to the IDE', async () => {
        const ch = channel()
        const host = new MessageHost(ch)
        host.writeFile('screens/new.yaml', 'type: Form\n')
        host.writeFile('../escape.yaml', 'x')
        host.writeFile('/abs.yaml', 'x')
        host.writeFile('notes.txt', 'x')
        host.writeFile('screens/new.yaml', null)
        expect(ch.posted.filter((m) => m.type === 'writeFile')).toEqual([
            { type: 'writeFile', path: 'screens/new.yaml', content: 'type: Form\n' },
            { type: 'writeFile', path: 'screens/new.yaml', content: null },
        ])
        expect(await host.openFile('other.yaml')).toBeUndefined()
        expect(ch.posted.at(-1)).toEqual({ type: 'openFile', path: 'other.yaml' })
    })
})

describe('resolveHost', () => {
    it('picks VS Code, then a JCEF-injected channel, else the standalone browser', () => {
        const vs = channel()
        ;(window as any).acquireVsCodeApi = () => vs
        expect(resolveHost()).toBeInstanceOf(MessageHost)
        expect(vs.posted).toEqual([{ type: 'ready' }])
        delete (window as any).acquireVsCodeApi
        const jcef = channel()
        ;(window as any).__mateuHost = jcef
        expect(resolveHost()).toBeInstanceOf(MessageHost)
        expect(jcef.posted).toEqual([{ type: 'ready' }])
        delete (window as any).__mateuHost
        expect(resolveHost()).not.toBeInstanceOf(MessageHost)
    })
})

describe('the standalone browser host', () => {
    it('keeps the draft in localStorage and starts from a sample', async () => {
        ;(window as any).__mateuBaseUrl = 'http://localhost:8080'
        const host = resolveHost()
        expect(host.baseUrl()).toBe('http://localhost:8080')
        const sample = await host.initialYaml()
        expect(sample).toMatch(/type:/)
        host.onContentChanged!('type: Form\ntitle: Draft\n')
        expect(await resolveHost().initialYaml()).toBe('type: Form\ntitle: Draft\n')
    })

    it('holds a whole mount: the board writes into it, openFile switches the draft keeping its edits', async () => {
        const host = resolveHost()
        expect(await host.listFiles!()).toEqual([])
        host.writeFile!('a.yaml', 'type: Form\ntitle: A\n')
        host.writeFile!('b.yaml', 'type: Form\ntitle: B\n')
        host.writeFile!('../x.yaml', 'nope')
        expect((await host.listFiles!()).map((f) => f.path)).toEqual(['a.yaml', 'b.yaml'])
        expect(await host.openFile!('missing.yaml')).toBeUndefined()
        expect(await host.openFile!('a.yaml')).toBe('type: Form\ntitle: A\n')
        expect(host.currentPath!()).toBe('a.yaml')
        host.onContentChanged!('type: Form\ntitle: A edited\n')
        expect(await host.openFile!('b.yaml')).toBe('type: Form\ntitle: B\n')
        // the edits of the file left behind went back into the mount
        expect((await host.listFiles!()).find((f) => f.path === 'a.yaml')!.content).toBe('type: Form\ntitle: A edited\n')
        host.writeFile!('b.yaml', null)
        expect((await host.listFiles!()).map((f) => f.path)).toEqual(['a.yaml'])
    })

    it('a corrupted project map degrades to no files instead of breaking the editor', async () => {
        localStorage.setItem('mateu-visual-editor-project', '{not json')
        const host = resolveHost()
        expect(await host.listFiles!()).toEqual([])
        host.writeFile!('a.yaml', 'x')
        expect((await host.listFiles!()).map((f) => f.path)).toEqual(['a.yaml'])
    })

    it('opens a shared link once: the design becomes the draft, the old draft is kept aside', async () => {
        localStorage.setItem('mateu-visual-editor-yaml', 'type: Form\ntitle: Mine\n')
        const link = await encodeShareLink({ v: 1, yaml: 'type: Form\ntitle: Shared\n', path: 'shared.yaml', files: { 'other.yaml': 'type: Form\n' } } as any, 'http://x/')
        const hash = link.slice(link.indexOf('#'))
        history.replaceState(null, '', location.pathname + hash)
        const host = resolveHost()
        expect(await host.initialYaml()).toBe('type: Form\ntitle: Shared\n')
        expect(host.currentPath!()).toBe('shared.yaml')
        expect((await host.listFiles!()).map((f) => f.path).sort()).toEqual(['other.yaml', 'shared.yaml'])
        expect(localStorage.getItem('mateu-visual-editor-yaml.previous')).toBe('type: Form\ntitle: Mine\n')
        expect(location.hash).toBe('') // a reload shows the edits, not the original again
    })
})
