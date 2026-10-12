import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as vscode from 'vscode'
import { EventEmitter, fake } from './test/vscode'
import { MateuVisualEditorProvider } from './MateuVisualEditorProvider'

// The custom editor's host side: the message bridge between the webview (the shared visual-editor
// bundle) and the document/workspace. A fake webview records what the extension posts.

let ext: string
let ws: string
let specs: string
let provider: MateuVisualEditorProvider

class FakeWebview {
    html = ''
    options: any
    readonly cspSource = 'vscode-resource:'
    readonly posted: any[] = []
    readonly received = new EventEmitter<any>()
    onDidReceiveMessage = this.received.event
    postMessage(m: unknown) { this.posted.push(m); return Promise.resolve(true) }
    asWebviewUri(uri: vscode.Uri) { return vscode.Uri.parse(`vscode-webview://x${uri.fsPath}`) }
    send(m: unknown) { this.received.fire(m) }
}

async function open(rel: string, text: string) {
    const file = join(specs, rel)
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, text)
    const doc = fake.doc(file)
    const webview = new FakeWebview()
    const disposed = new EventEmitter<void>()
    const panel = { webview, onDidDispose: disposed.event }
    await provider.resolveCustomTextEditor(doc as any, panel as any, {} as any)
    return { doc, webview, dispose: () => disposed.fire(), file }
}
const flush = () => new Promise((r) => setTimeout(r, 10))

beforeEach(() => {
    fake.reset()
    ext = mkdtempSync(join(tmpdir(), 'mateu-ext-'))
    mkdirSync(join(ext, 'media/assets'), { recursive: true })
    writeFileSync(join(ext, 'media/index.html'), '<html><head><script type="module" src="./assets/index-abc.js"></script></head><body></body></html>')
    ws = mkdtempSync(join(tmpdir(), 'mateu-ws-'))
    specs = join(ws, 'src/main/resources/specs/ui')
    mkdirSync(specs, { recursive: true })
    fake.workspaceRoot = ws
    provider = new MateuVisualEditorProvider({ extensionUri: vscode.Uri.file(ext), extensionPath: ext } as any)
})
afterEach(() => {
    (provider as any).proxy.dispose()
    rmSync(ext, { recursive: true, force: true })
    rmSync(ws, { recursive: true, force: true })
})

describe('the visual editor host', () => {
    it('builds the webview with a nonce CSP, the loopback baseUrl and the entry rewritten to a webview URI', async () => {
        writeFileSync(join(specs, 'sources.yaml'), 'type: Sources\nsources:\n  - name: s\n    source:\n      url: https://api.example.com/x\n')
        const { webview } = await open('page.yaml', 'type: Form\ntitle: A\n')
        const port = (provider as any).proxy.port
        expect(port).toBeGreaterThan(0)
        expect(webview.html).toContain(`window.__mateuBaseUrl = 'http://127.0.0.1:${port}'`)
        expect(webview.html).toContain('vscode-webview://x' + join(ext, 'media/assets/index-abc.js'))
        const csp = /content="([^"]+)"/.exec(webview.html)![1]
        expect(csp).toMatch(/script-src 'nonce-[A-Za-z0-9_-]{32}'/)
        expect(csp).toContain(`frame-src http://127.0.0.1:${port}`)
        // the declared REST source origin is allowed, an arbitrary one is not
        expect(csp).toContain('https://api.example.com')
        expect(csp).not.toMatch(/connect-src[^;]*https:(?:\s|;|$)/)
        // the module is a resource root (its images are shown in the pickers)
        expect(webview.options.localResourceRoots.map((u: vscode.Uri) => u.fsPath)).toContain(ws)
    })

    it('answers ready with init: the document text, the loopback baseUrl and its specs/ui path', async () => {
        const { webview } = await open('orders/list.yaml', 'type: Listing\n')
        webview.send({ type: 'ready' })
        expect(webview.posted.at(-1)).toEqual({
            type: 'init', yaml: 'type: Listing\n', baseUrl: `http://127.0.0.1:${(provider as any).proxy.port}`, path: 'orders/list.yaml',
        })
    })

    it('applies contentChanged/save to the document (dirty, not saved) and does not echo it back', async () => {
        const { webview, doc } = await open('page.yaml', 'type: Form\ntitle: A\n')
        webview.send({ type: 'contentChanged', yaml: 'type: Form\ntitle: B\n' })
        await flush()
        expect(doc.getText()).toBe('type: Form\ntitle: B\n')
        expect(doc.saved).toBe(0)
        expect(webview.posted.filter((m) => m.type === 'externalChange')).toEqual([])
        webview.send({ type: 'save', yaml: 'type: Form\ntitle: C\n' })
        await flush()
        expect(doc.getText()).toBe('type: Form\ntitle: C\n')
        // ignored: not a string, or identical
        webview.send({ type: 'save', yaml: 42 })
        webview.send(null)
        expect(doc.getText()).toBe('type: Form\ntitle: C\n')
    })

    it('pushes an out-of-band edit (text editor, disk) to the webview', async () => {
        const { webview, doc } = await open('page.yaml', 'type: Form\n')
        doc.text = 'type: Form\ntitle: typed\n'
        fake.onDidChangeTextDocument.fire({ document: doc, contentChanges: [{}] })
        expect(webview.posted.at(-1)).toEqual({ type: 'externalChange', yaml: 'type: Form\ntitle: typed\n' })
        // another document's change is not this editor's business
        fake.onDidChangeTextDocument.fire({ document: fake.doc(join(specs, 'other.yaml')), contentChanges: [{}] })
        expect(webview.posted.filter((m) => m.type === 'externalChange')).toHaveLength(1)
    })

    it('hands the whole mount to the reference pickers on listFiles', async () => {
        writeFileSync(join(specs, 'routes.yaml'), 'type: Routes\nroutes: []\n')
        const { webview } = await open('nested/page.yaml', 'type: Form\n')
        webview.send({ type: 'listFiles' })
        await flush()
        const files = webview.posted.find((m) => m.type === 'files').files
        expect(files.map((f: any) => f.path).sort()).toEqual(['nested/page.yaml', 'routes.yaml'])
        expect(files.find((f: any) => f.path === 'routes.yaml').content).toBe('type: Routes\nroutes: []\n')
    })

    it('a file created while the editor is open reaches the pickers (onFilesChanged)', async () => {
        vi.useFakeTimers()
        try {
            const { webview } = await open('page.yaml', 'type: Form\n')
            const watcher = fake.watchers.find((w) => typeof w.pattern !== 'string' && w.pattern.pattern === '**/*.{yaml,yml}')!
            writeFileSync(join(specs, 'new.yaml'), 'type: Form\ntitle: New\n')
            watcher.created.fire(vscode.Uri.file(join(specs, 'new.yaml')))
            watcher.changed.fire(vscode.Uri.file(join(specs, 'new.yaml'))) // debounced into one
            await vi.advanceTimersByTimeAsync(600)
            const posts = webview.posted.filter((m) => m.type === 'files')
            expect(posts).toHaveLength(1)
            expect(posts[0].files.map((f: any) => f.path)).toContain('new.yaml')
        } finally {
            vi.useRealTimers()
        }
    })

    it('rebuilds the webview when the declared REST origins change', async () => {
        vi.useFakeTimers()
        try {
            const { webview } = await open('page.yaml', 'type: Form\n')
            const before = webview.html
            const watcher = fake.watchers.find((w) => typeof w.pattern !== 'string' && w.pattern.pattern === '**/*.{yaml,yml}')!
            writeFileSync(join(specs, 'sources.yaml'), 'type: Sources\nsources:\n  - name: s\n    source:\n      url: https://new.example.org/x\n')
            watcher.changed.fire(vscode.Uri.file(join(specs, 'sources.yaml')))
            await vi.advanceTimersByTimeAsync(600)
            expect(webview.html).not.toBe(before)
            expect(webview.html).toContain('https://new.example.org')
        } finally {
            vi.useRealTimers()
        }
    })

    it('writes, creates and deletes other mount files for the board — never outside specs/ui', async () => {
        const { webview } = await open('page.yaml', 'type: Form\n')
        webview.send({ type: 'writeFile', path: 'screens/new.yaml', content: 'type: Form\ntitle: N\n' })
        await flush(); await flush()
        expect(readFileSync(join(specs, 'screens/new.yaml'), 'utf8')).toBe('type: Form\ntitle: N\n')
        webview.send({ type: 'writeFile', path: 'screens/new.yaml', content: 'type: Form\ntitle: M\n' })
        await flush(); await flush()
        expect(readFileSync(join(specs, 'screens/new.yaml'), 'utf8')).toBe('type: Form\ntitle: M\n')
        webview.send({ type: 'writeFile', path: 'screens/new.yaml', content: null })
        await flush()
        expect(existsSync(join(specs, 'screens/new.yaml'))).toBe(false)
        webview.send({ type: 'writeFile', path: '../../../../evil.yaml', content: 'x' })
        await flush()
        expect(existsSync(join(ws, 'evil.yaml'))).toBe(false)
        expect(existsSync(join(ws, 'src/evil.yaml'))).toBe(false)
    })

    it('opens another mount file in a visual editor of its own, refusing ..', async () => {
        const { webview } = await open('page.yaml', 'type: Form\n')
        webview.send({ type: 'openFile', path: 'other.yaml' })
        webview.send({ type: 'openFile', path: '../x.yaml' })
        const opened = fake.executed.filter((e) => e.command === 'vscode.openWith')
        expect(opened).toHaveLength(1)
        expect((opened[0].args[0] as vscode.Uri).fsPath).toBe(join(specs, 'other.yaml'))
        expect(opened[0].args[1]).toBe('mateu.visualEditor')
    })

    it('adds an image to the project and lists it; a cancelled dialog answers null', async () => {
        const src = join(ext, 'logo.png')
        writeFileSync(src, Buffer.from([0x89, 0x50, 0x4e, 0x47]))
        const { webview } = await open('page.yaml', 'type: Form\n')
        fake.answer(undefined)
        webview.send({ type: 'addImage' })
        await flush()
        expect(webview.posted.at(-1)).toEqual({ type: 'imageAdded', image: null })
        fake.answer([vscode.Uri.file(src)])
        webview.send({ type: 'addImage' })
        await flush()
        const added = webview.posted.find((m) => m.type === 'imageAdded' && m.image)
        expect(added.image.path).toMatch(/logo\.png$/)
        expect(added.image.src).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//)
        webview.send({ type: 'listImages' })
        expect(webview.posted.at(-1).images.map((i: any) => i.path)).toContain(added.image.path)
    })

    it('explains how to build the bundle when media/ is missing', async () => {
        rmSync(join(ext, 'media'), { recursive: true })
        const { webview } = await open('page.yaml', 'type: Form\n')
        expect(webview.html).toContain('npm run copy:web')
    })

    it('stops listening when the panel is closed', async () => {
        const { webview, doc, dispose } = await open('page.yaml', 'type: Form\n')
        dispose()
        expect(fake.watchers.every((w) => w.disposed)).toBe(true)
        doc.text = 'changed'
        fake.onDidChangeTextDocument.fire({ document: doc, contentChanges: [{}] })
        webview.send({ type: 'ready' })
        expect(webview.posted).toEqual([])
    })
})
