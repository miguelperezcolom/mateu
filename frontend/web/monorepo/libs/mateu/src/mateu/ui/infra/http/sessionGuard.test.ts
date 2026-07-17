import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleSessionExpired, onSessionExpired } from './sessionGuard.ts'

afterEach(() => onSessionExpired(undefined))

describe('sessionGuard', () => {
    it('resolves the original call when the handler re-authenticates and retries', async () => {
        onSessionExpired(context => context.retry())
        const retried = vi.fn().mockResolvedValue('fresh-response')
        await expect(handleSessionExpired(new Error('401'), retried)).resolves.toBe('fresh-response')
        expect(retried).toHaveBeenCalledOnce()
    })

    it('fails with the original error when the handler gives up', async () => {
        const original = new Error('401')
        onSessionExpired(context => context.giveUp())
        const retried = vi.fn()
        await expect(handleSessionExpired(original, retried)).rejects.toBe(original)
        expect(retried).not.toHaveBeenCalled()
    })

    it('propagates the retry failure when the retried request also fails', async () => {
        onSessionExpired(context => context.retry())
        const secondFailure = new Error('still 401')
        await expect(
            handleSessionExpired(new Error('401'), vi.fn().mockRejectedValue(secondFailure)),
        ).rejects.toBe(secondFailure)
    })

    it('settles only once even if the handler calls both retry and giveUp', async () => {
        onSessionExpired(context => {
            context.retry()
            context.giveUp()
        })
        await expect(
            handleSessionExpired(new Error('401'), vi.fn().mockResolvedValue('ok')),
        ).resolves.toBe('ok')
    })

    it('without any handler the request fails exactly like before the guard existed', async () => {
        const original = new Error('401')
        // node env: no document — the guard must fall back to giveUp
        await expect(handleSessionExpired(original, vi.fn())).rejects.toBe(original)
    })
})
