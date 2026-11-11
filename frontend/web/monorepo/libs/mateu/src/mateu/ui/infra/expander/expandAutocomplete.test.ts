// WCAG 1.3.5: a specsOnly bundle's FormField carries the same autocomplete token the server sends
// (Java FieldMapper.autocompleteOf): the declared one, else `email` for an editable email field.
import { describe, expect, it } from 'vitest'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'

const auto = (field: Record<string, unknown>) =>
    ((expandComponent({ type: 'FormField', id: 'f', ...field } as FluentNode) as unknown as { metadata: Record<string, unknown> }).metadata).autocomplete

describe('expander — input purpose', () => {
    it('keeps a declared token, infers email, and leaves the rest without one', () => {
        expect(auto({ autocomplete: ' given-name ' })).toBe('given-name')
        expect(auto({ stereotype: 'email' })).toBe('email')
        expect(auto({ stereotype: 'email', autocomplete: 'off' })).toBe('off')
        expect(auto({ stereotype: 'email', readOnly: true })).toBeUndefined()
        expect(auto({ autocomplete: '' })).toBeUndefined()
        expect(auto({})).toBeUndefined()
    })
})
