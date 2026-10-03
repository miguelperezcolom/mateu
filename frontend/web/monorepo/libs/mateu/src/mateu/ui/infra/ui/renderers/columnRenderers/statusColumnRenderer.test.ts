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
        expect(toStatus('AVAILABLE')).toEqual({ type: StatusType.SUCCESS, message: 'AVAILABLE' })
        expect(toStatus('Provisioning')).toEqual({ type: StatusType.WARNING, message: 'Provisioning' })
        expect(toStatus('in-progress')!.type).toBe(StatusType.WARNING)
        expect(toStatus('TERMINATED')!.type).toBe(StatusType.DANGER)
        expect(toStatus('BLUE')).toEqual({ type: StatusType.NONE, message: 'BLUE' })
    })
    it('paints nothing for nothing', () => {
        expect(toStatus(undefined)).toBeUndefined()
        expect(toStatus('')).toBeUndefined()
    })
})
