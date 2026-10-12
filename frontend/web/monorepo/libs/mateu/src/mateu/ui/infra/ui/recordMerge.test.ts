import { describe, expect, it } from 'vitest'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import type RecordMerge from '@mateu/shared/apiClients/dtos/componentmetadata/RecordMerge'
import { CUSTOM, initialPicks, mergeParameters, mergeSummary, mergedValue, valueText, visibleFields } from './recordMerge'

const merge: RecordMerge = {
    type: ComponentMetadataType.RecordMerge,
    title: 'Duplicate guests',
    records: [{ id: 'a', label: 'Profile 1021' }, { id: 'b', label: 'Profile 3388' }],
    fields: [
        { fieldId: 'name', label: 'Name', values: ['Ana García', 'Ana García'], chosen: 'a', differs: false },
        { fieldId: 'email', label: 'Email', values: [null, 'ana@example.com'], chosen: 'b', differs: true },
        { fieldId: 'phone', label: 'Phone', values: ['+34 600', '+34 611'], editable: true, differs: true },
    ],
    mergeActionId: 'mergeProfiles',
    parameters: { survivor: 'a' },
}

describe('recordMerge', () => {
    it('starts from the server picks, else from the first record with a value', () => {
        expect(initialPicks(merge)).toEqual({ name: 'a', email: 'b', phone: 'a' })
    })

    it('takes each value from the record picked, or what was typed', () => {
        const picks = { name: 'a', email: 'b', phone: CUSTOM }
        expect(mergedValue(merge, merge.fields[1], picks, {})).toBe('ana@example.com')
        expect(mergedValue(merge, merge.fields[2], picks, { phone: '+34 622' })).toBe('+34 622')
    })

    it('sends the component parameters with _merged and _choices', () => {
        const parameters = mergeParameters(merge, { name: 'a', email: 'b', phone: CUSTOM }, { phone: '+34 622' })
        expect(parameters).toEqual({
            survivor: 'a',
            _merged: { name: 'Ana García', email: 'ana@example.com', phone: '+34 622' },
            _choices: { name: 'a', email: 'b', phone: 'custom' },
        })
    })

    it('can show only the rows that differ, and sums them up', () => {
        expect(visibleFields(merge, true).map((f) => f.fieldId)).toEqual(['email', 'phone'])
        expect(visibleFields(merge, false)).toHaveLength(3)
        expect(mergeSummary(merge, { phone: CUSTOM })).toEqual({ fields: 3, differ: 2, custom: 1 })
    })

    it('shows any value as text', () => {
        expect(valueText(null)).toBe('')
        expect(valueText(true)).toBe('true')
        expect(valueText({ a: 1 })).toBe('{"a":1}')
    })
})
