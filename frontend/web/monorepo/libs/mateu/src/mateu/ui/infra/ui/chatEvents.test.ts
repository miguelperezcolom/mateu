import { describe, expect, it } from 'vitest'
import { claimEvent, isEventClaimed, jsonDefinitionOf, previewParametersOf, renderScreenRequestOf } from './chatEvents'

describe('renderScreenRequestOf', () => {
    it('reads the YAML, the target and the title of a render-screen detail', () => {
        expect(renderScreenRequestOf({ yaml: 'type: Text\ntext: hi', target: 'drawer', title: 'Check-in' }))
            .toEqual({ yaml: 'type: Text\ntext: hi', target: 'drawer', title: 'Check-in' })
    })

    it('defaults to the content area, and an unknown target is the content area too', () => {
        expect(renderScreenRequestOf({ yaml: 'type: Text' })).toEqual({ yaml: 'type: Text', target: 'content' })
        expect(renderScreenRequestOf({ yaml: 'type: Text', target: 'popover' })!.target).toBe('content')
        expect(renderScreenRequestOf({ yaml: 'type: Text', target: 'dialog' })!.target).toBe('dialog')
    })

    it('takes a uidl component tree, as an object or as JSON text; yaml wins when both are there', () => {
        expect(renderScreenRequestOf({ uidl: { type: 'Text', text: 'hi' } })!.yaml).toBe('{"type":"Text","text":"hi"}')
        expect(renderScreenRequestOf({ uidl: '{"type":"Text"}' })!.yaml).toBe('{"type":"Text"}')
        expect(renderScreenRequestOf({ yaml: 'type: Card', uidl: { type: 'Text' } })!.yaml).toBe('type: Card')
    })

    it('is nothing without a definition to render', () => {
        expect(renderScreenRequestOf(undefined)).toBeNull()
        expect(renderScreenRequestOf('type: Text')).toBeNull()
        expect(renderScreenRequestOf({})).toBeNull()
        expect(renderScreenRequestOf({ yaml: '   ', title: 'x' })).toBeNull()
        const cyclic: Record<string, unknown> = {}
        cyclic.self = cyclic
        expect(renderScreenRequestOf({ uidl: cyclic })).toBeNull()
    })

    it('a blank title is no title', () => {
        expect(renderScreenRequestOf({ yaml: 'type: Text', title: ' ' })).toEqual({ yaml: 'type: Text', target: 'content' })
    })
})

describe('the preview call', () => {
    it('sends the definition as the reserved _yaml parameter', () => {
        expect(previewParametersOf({ yaml: 'type: Text', target: 'content' })).toEqual({ _yaml: 'type: Text' })
    })

    it('without a backend only a JSON definition can be expanded in the browser', () => {
        expect(jsonDefinitionOf({ yaml: '{"type":"Text","text":"hi"}', target: 'content' })).toEqual({ type: 'Text', text: 'hi' })
        expect(jsonDefinitionOf({ yaml: 'type: Text', target: 'content' })).toBeNull()
        expect(jsonDefinitionOf({ yaml: '{not json', target: 'content' })).toBeNull()
        expect(jsonDefinitionOf({ yaml: '[1]', target: 'content' })).toBeNull()
    })
})

describe('claiming', () => {
    it('remembers which events a subscriber took', () => {
        const a = new Event('x')
        const b = new Event('x')
        claimEvent(a)
        expect(isEventClaimed(a)).toBe(true)
        expect(isEventClaimed(b)).toBe(false)
    })
})
