import { describe, expect, it } from 'vitest'
import { parseOverrides, resolveComponentState } from './common'

describe('parseOverrides', () => {
    it('parses a JSON object', () => {
        expect(parseOverrides('{"a": 1, "b": "x"}')).toEqual({ a: 1, b: 'x' })
    })

    it('wraps non-JSON content as { value }', () => {
        expect(parseOverrides('plain text')).toEqual({ value: 'plain text' })
    })

    it('returns an empty object for undefined or empty input', () => {
        expect(parseOverrides(undefined)).toEqual({})
        expect(parseOverrides('')).toEqual({})
    })
})

describe('resolveComponentState', () => {
    it('uses the acting component own state for a direct (non-bubbled) action', () => {
        const own = { searchText: 'ma', page: 0 }
        expect(resolveComponentState(own, {})).toEqual(own)
        expect(resolveComponentState(own, undefined)).toEqual(own)
    })

    it('prefers parameters.initiatorState when a descendant bubbled the action up', () => {
        // A @ViewToolbarButton on a crud detail view: the crud host catches the bubbled action;
        // its own state is the list (no id), but the form the button lives on rode up in
        // initiatorState WITH its id. That is what getComponentState(EntityType.class) must see.
        const crudHostState = { _route: 'list', page: 0 }
        const parameters = { initiatorState: { id: '42', name: 'My form' } }
        expect(resolveComponentState(crudHostState, parameters)).toEqual({ id: '42', name: 'My form' })
    })

    it('returns a fresh copy, not the original references', () => {
        const own = { a: 1 }
        const out = resolveComponentState(own, {})
        expect(out).not.toBe(own)
        const initiator = { id: '7' }
        const out2 = resolveComponentState({}, { initiatorState: initiator })
        expect(out2).not.toBe(initiator)
    })

    it('falls back to own state when initiatorState is not an object', () => {
        const own = { a: 1 }
        expect(resolveComponentState(own, { initiatorState: 'nope' })).toEqual(own)
        expect(resolveComponentState(own, { initiatorState: null })).toEqual(own)
    })
})
