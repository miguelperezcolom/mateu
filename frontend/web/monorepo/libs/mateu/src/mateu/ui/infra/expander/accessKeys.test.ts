import { describe, expect, it, beforeEach, vi } from 'vitest'
import { __resetAccessWarningForTests, withoutAccessKeys } from './accessKeys.ts'
import { expandDefinition } from './expandDefinition.ts'

beforeEach(() => __resetAccessWarningForTests())

describe('access keys with no server', () => {
    it('are stripped (rendered unrestricted) and warned about once', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const spec = {
            layout: { type: 'VerticalLayout', content: [
                { type: 'Button', label: 'Delete', actionId: 'delete', disabledUnless: { roles: ['manager'] } },
                { type: 'FormField', id: 'salary', readOnlyUnless: { roles: ['hr'] }, eyesOnly: { roles: ['staff'] } },
            ] },
            actions: [{ id: 'delete', access: { roles: ['manager'] } }],
        }
        const out = withoutAccessKeys(spec) as any
        expect(out.layout.content[0]).toEqual({ type: 'Button', label: 'Delete', actionId: 'delete' })
        expect(out.layout.content[1]).toEqual({ type: 'FormField', id: 'salary' })
        expect(out.actions[0]).toEqual({ id: 'delete' })
        expect(spec.actions[0]).toHaveProperty('access')
        withoutAccessKeys(spec)
        expect(warn).toHaveBeenCalledTimes(1)
        warn.mockRestore()
    })
    it('a spec without them is returned as is, no warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const spec = { layout: { type: 'Text', text: 'hi' } }
        expect(withoutAccessKeys(spec)).toBe(spec)
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })
    it('the expander renders a guarded component instead of hiding it', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const inc = expandDefinition({
            layout: { type: 'VerticalLayout', content: [{ type: 'Text', text: 'secret', eyesOnly: { roles: ['admin'] } }] },
        } as any, 'r')
        expect(JSON.stringify(inc)).toContain('secret')
        expect(JSON.stringify(inc)).not.toContain('eyesOnly')
        vi.restoreAllMocks()
    })
})
