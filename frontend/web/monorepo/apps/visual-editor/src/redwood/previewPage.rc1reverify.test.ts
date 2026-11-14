// @vitest-environment jsdom
// rc.1 re-verification of GA review 2 N-5: the Redwood canvas page (Play) takes messages from
// whatever page frames it — `e.source === win.parent` with no origin check. A foreign framing page
// can answer the app's calls and move it. NOT FIXED at rc.1: pinned with it.fails.
// (Redwood's own listener, apps/redwood/poc/editorPreview.mjs, has the same shape — read.)
import { afterEach, describe, expect, it, vi } from 'vitest'
import { installPlayBridge } from './previewPage'
import { PREVIEW_KEY } from '../canvas/redwoodProtocol'

afterEach(() => vi.restoreAllMocks())

describe('rc.1 re-verify N-5: the canvas page listens to its parent only on a trusted origin', () => {
    it.fails('a navigate message from a framing page of another origin is ignored', () => {
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
})
