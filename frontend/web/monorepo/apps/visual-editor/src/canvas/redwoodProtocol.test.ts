import { describe, it, expect } from 'vitest'
import { frameMessageOf, redwoodPreviewUrl, renderMessage, selectMessage, PREVIEW_KEY } from './redwoodProtocol'
import { idToPath, pathToId } from '../model/pageModel'

describe('the Redwood canvas protocol', () => {
    it('reads only the frame messages, ignoring whatever else reaches the window (the IDE host)', () => {
        expect(frameMessageOf({ mateuPreview: 'click', id: 've-0-1' })).toEqual({ mateuPreview: 'click', id: 've-0-1' })
        expect(frameMessageOf({ mateuPreview: 'boot-failed', url: 'https://static.oracle.com/x.js' })?.mateuPreview).toBe('boot-failed')
        expect(frameMessageOf({ type: 'init', yaml: '' })).toBeNull()
        expect(frameMessageOf({ mateuPreview: 'render', fragment: {} })).toBeNull() // that one goes the other way
        expect(frameMessageOf('hello')).toBeNull()
        expect(frameMessageOf(null)).toBeNull()
    })

    it('hands the frame a plain copy of the fragment (postMessage cannot clone proxies or functions)', () => {
        const fragment = { component: { type: 'ClientSide', id: 've-root' }, state: { a: 1 } }
        const msg = renderMessage(fragment) as { mateuPreview: string; fragment: unknown }
        expect(msg[PREVIEW_KEY as 'mateuPreview']).toBe('render')
        expect(msg.fragment).toEqual(fragment)
        expect(msg.fragment).not.toBe(fragment)
        expect(selectMessage('ve-1', 'Button', true)).toEqual({ mateuPreview: 'select', id: 've-1', label: 'Button', reveal: true })
    })

    it('a clicked id maps back to the node the editor stamped (the same ve-<path> ids as the Vaadin canvas)', () => {
        expect(idToPath(pathToId([2, 'toolbar.0', 1]))).toEqual([2, 'toolbar.0', 1])
        // ids the server sets (a Card's placeholder) are not the editor's: nothing to select
        expect(idToPath('fieldId')).toBeNull()
    })

    it('finds the canvas page next to the editor, unless the host says where it is', () => {
        expect(redwoodPreviewUrl({ location: { href: 'http://127.0.0.1:5199/index.html' } })).toBe('http://127.0.0.1:5199/redwood-preview.html')
        expect(redwoodPreviewUrl({ location: { href: 'http://127.0.0.1:5199/' } })).toBe('http://127.0.0.1:5199/redwood-preview.html')
        expect(redwoodPreviewUrl({ __mateuRedwoodPreview: 'http://127.0.0.1:4711/redwood-preview.html', location: { href: 'vscode-webview://x/index.html' } }))
            .toBe('http://127.0.0.1:4711/redwood-preview.html')
    })
})
