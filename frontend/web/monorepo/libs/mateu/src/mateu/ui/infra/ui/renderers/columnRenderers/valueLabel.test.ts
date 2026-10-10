import { describe, expect, it } from 'vitest'
import { valueLabel } from './valueLabel'
import { toStatus } from './statusColumnRenderer'
import { StatusType } from '@mateu/shared/apiClients/dtos/componentmetadata/StatusType'

const labels = { IN_HOUSE: 'In house', DEPARTED: 'Checked out' }

describe('valueLabel', () => {
    it('shows the label the column declares for a raw value', () => {
        expect(valueLabel('IN_HOUSE', labels)).toBe('In house')
    })

    it('keeps a value the column has no label for, and any value of a column without labels', () => {
        expect(valueLabel('DUE_OUT', labels)).toBe('DUE_OUT')
        expect(valueLabel('IN_HOUSE', null)).toBe('IN_HOUSE')
        expect(valueLabel('IN_HOUSE', undefined)).toBe('IN_HOUSE')
    })

    it('leaves empty and structured values alone', () => {
        expect(valueLabel(null, labels)).toBeNull()
        expect(valueLabel(undefined, labels)).toBeUndefined()
        const object = { label: 'x' }
        expect(valueLabel(object, labels)).toBe(object)
    })
})

describe('toStatus with value labels', () => {
    it('shows the label and still picks the tone by the raw value', () => {
        const status = toStatus('DEPARTED', { DEPARTED: 'danger' }, labels)
        expect(status).toEqual({ type: StatusType.DANGER, message: 'Checked out' })
    })

    it('reads the word of the raw value when no tone is declared', () => {
        expect(toStatus('FAILED', null, { FAILED: 'Failed to sync' })).toEqual({
            type: StatusType.DANGER, message: 'Failed to sync',
        })
    })
})
