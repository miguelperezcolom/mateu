import { describe, expect, it } from 'vitest'
import type RecordSwitcher from '@mateu/shared/apiClients/dtos/componentmetadata/RecordSwitcher'
import type Option from '@mateu/shared/apiClients/dtos/componentmetadata/Option'
import { currentSwitcherOption, filterSwitcherOptions, switcherPick } from './recordSwitcherModel'

const option = (value: string, label: string, description = ''): Option =>
    ({ value, label, description, image: '', imageStyle: '', icon: '' })

const switcher = (over: Partial<RecordSwitcher> = {}): RecordSwitcher => ({
    options: [option('c1', 'Ada Lovelace', 'Analytical Engines'), option('c2', 'Grace Hopper', 'Navy'),
        option('c3', 'José Martí', 'Habana')],
    value: 'c1',
    type: 'object',
    actionId: '_switchRecord',
    ...over,
})

/** The header record/context switcher (Redwood selectObject/selectContext). */
describe('the record switcher', () => {
    it('filters by every word, in label or description, ignoring case and accents', () => {
        const options = switcher().options
        expect(filterSwitcherOptions(options, '').map(o => o.value)).toEqual(['c1', 'c2', 'c3'])
        expect(filterSwitcherOptions(options, 'grace').map(o => o.value)).toEqual(['c2'])
        expect(filterSwitcherOptions(options, 'navy hop').map(o => o.value)).toEqual(['c2'])
        expect(filterSwitcherOptions(options, 'jose habana').map(o => o.value)).toEqual(['c3'])
        expect(filterSwitcherOptions(options, 'nobody')).toEqual([])
    })

    it('knows the current option, comparing values as strings', () => {
        expect(currentSwitcherOption(switcher())?.label).toBe('Ada Lovelace')
        expect(currentSwitcherOption(switcher({ value: 'nope' }))).toBeUndefined()
    })

    it('dispatches the page action with the picked value in _record', () => {
        expect(switcherPick(switcher(), 'c2')).toEqual({ actionId: '_switchRecord', parameters: { _record: 'c2' } })
    })

    it('sends nothing for the current value or when disabled', () => {
        expect(switcherPick(switcher(), 'c1')).toBeNull()
        expect(switcherPick(switcher({ disabled: true }), 'c2')).toBeNull()
        expect(switcherPick(switcher(), undefined)).toBeNull()
    })
})
