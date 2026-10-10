// A status column over a REST API: the API answers a plain word ("AVAILABLE"), not the {type,
// message} a Mateu backend sends. It used to paint an EMPTY badge.
import { describe, expect, it } from 'vitest'
import { toStatus } from './statusColumnRenderer'
import { StatusType } from '@mateu/shared/apiClients/dtos/componentmetadata/StatusType'

describe('toStatus', () => {
    it('keeps a backend status as it is', () => {
        const s = { type: StatusType.DANGER, message: 'Blocked' }
        expect(toStatus(s)).toBe(s)
    })
    it('shows a plain word as is, with the badge its usual meaning gives it', () => {
        expect(toStatus('AVAILABLE')).toEqual({ type: StatusType.SUCCESS, message: 'Available' })
        expect(toStatus('Provisioning')).toEqual({ type: StatusType.WARNING, message: 'Provisioning' })
        expect(toStatus('in-progress')!.type).toBe(StatusType.WARNING)
        expect(toStatus('TERMINATED')!.type).toBe(StatusType.DANGER)
        expect(toStatus('BLUE')).toEqual({ type: StatusType.NONE, message: 'Blue' })
    })
    it('paints nothing for nothing', () => {
        expect(toStatus(undefined)).toBeUndefined()
        expect(toStatus('')).toBeUndefined()
    })
})

describe('a bare constant reads as words (the enum-label rule, for values with no labels)', () => {
    it('humanizes OUT_OF_STOCK like the server humanizes an enum constant', () => {
        expect(toStatus('OUT_OF_STOCK')).toEqual({ type: StatusType.NONE, message: 'Out of stock' })
        expect(toStatus('IN_PROGRESS')?.message).toBe('In progress')
        expect(toStatus('Provisioning')?.message).toBe('Provisioning')
    })
})
