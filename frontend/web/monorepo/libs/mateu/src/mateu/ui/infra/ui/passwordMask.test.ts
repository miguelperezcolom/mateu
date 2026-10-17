// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { PASSWORD_MASK, shownReadOnlyValue } from './passwordMask'

describe('a read-only password', () => {
    it('shows a fixed mask whatever its length', () => {
        expect(shownReadOnlyValue({ stereotype: 'password' }, 's3cr3t')).toBe(PASSWORD_MASK)
        expect(shownReadOnlyValue({ stereotype: 'password' }, 'a-much-longer-secret-value')).toBe(PASSWORD_MASK)
    })
    it('stays empty when there is nothing to hide', () => {
        expect(shownReadOnlyValue({ stereotype: 'password' }, '')).toBe('')
        expect(shownReadOnlyValue({ stereotype: 'password' }, null)).toBe('')
    })
    it('leaves any other field alone', () => {
        expect(shownReadOnlyValue({ stereotype: 'regular' }, 'visible')).toBe('visible')
        expect(shownReadOnlyValue(undefined, 3)).toBe(3)
    })
})

describe('the neutral field renderer', () => {
    it('masks a read-only password', async () => {
        const { render } = await import('lit')
        const { renderNeutralField } = await import('./renderers/neutralFieldRenderer')
        const host = document.createElement('div')
        render(renderNeutralField({ id: 'p', metadata: { type: 'FormField', fieldId: 'p', stereotype: 'password', readOnly: true } } as any, { p: 'hunter2' }), host)
        expect(host.textContent).toContain(PASSWORD_MASK)
        expect(host.textContent).not.toContain('hunter2')
    })
})
