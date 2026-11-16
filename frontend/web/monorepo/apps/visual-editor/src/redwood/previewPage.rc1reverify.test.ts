// @vitest-environment jsdom
// rc.1 re-verification of GA review 2 N-5: the Redwood canvas page (Play) takes messages from
// whatever page frames it — `e.source === win.parent` with no origin check. A foreign framing page
// can answer the app's calls and move it. it.fails at rc.1; fixed for rc.2 (isEditorOrigin).
// (Redwood's own listener, apps/redwood/poc/editorPreview.mjs, has the same shape — read.)
import { afterEach, describe, expect, it, vi } from 'vitest'
import { installPlayBridge, isEditorOrigin } from './previewPage'
import { PREVIEW_KEY } from '../canvas/redwoodProtocol'

afterEach(() => vi.restoreAllMocks())

describe('rc.1 re-verify N-5: the canvas page listens to its parent only on a trusted origin', () => {
    it('a navigate message from a framing page of another origin is ignored', () => {
        vi.spyOn(window, 'postMessage').mockImplementation((() => {}) as any)
        history.replaceState(null, '', '/#/home')
        installPlayBridge(window)
        // in a top-level jsdom window.parent === window: the "parent" here is a foreign framer
        window.dispatchEvent(new MessageEvent('message', {
            data: { [PREVIEW_KEY]: 'navigate', route: '/evil' },
            origin: 'https://evil.example', source: window,
        }))
        expect(location.hash).toBe('#/home')
    })
    it("the editor's own origin, a VS Code webview and a declared host origin are the editor; nothing else is", () => {
        const win = { location: { origin: 'http://127.0.0.1:8123' }, __mateuHostOrigin: 'https://host.example' }
        expect(isEditorOrigin('http://127.0.0.1:8123', win)).toBe(true)
        expect(isEditorOrigin('vscode-webview://abc', win)).toBe(true)
        expect(isEditorOrigin('https://host.example', win)).toBe(true)
        expect(isEditorOrigin('https://evil.example', win)).toBe(false)
        expect(isEditorOrigin('null', win)).toBe(false)
        expect(isEditorOrigin('', win)).toBe(false)
        expect(isEditorOrigin('https://host.example', { location: { origin: 'http://x' } })).toBe(false)
    })
})
