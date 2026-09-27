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
    it("keeps the holder's own state for a list field's action bubbled from its row editor", () => {
        // A wizard step's rooms list: the row editor's Save bubbles up as rooms_create. The holder's
        // state has the list (rooms_rowClass) and the wizard's position; the row is in initiatorState.
        const holder = { position: 1, hotelCode: 'MRU01', rooms: [], rooms_rowClass: 'x.RoomViewModel' }
        const parameters = { initiatorState: { roomTypeCode: 'SWU', adults: 2 } }
        expect(resolveComponentState(holder, parameters, 'rooms_create')).toEqual(holder)
        expect(resolveComponentState(holder, parameters, 'rooms_create-and-stay')).toEqual(holder)
        expect(resolveComponentState(holder, parameters, 'rooms_cancel')).toEqual(holder)
    })

    it('still prefers initiatorState for an action that is not a list of the holder', () => {
        const holder = { position: 1, rooms_rowClass: 'x.RoomViewModel' }
        const parameters = { initiatorState: { id: '42' } }
        expect(resolveComponentState(holder, parameters, 'guests_create')).toEqual({ id: '42' })
        expect(resolveComponentState(holder, parameters, 'approve')).toEqual({ id: '42' })
    })

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
