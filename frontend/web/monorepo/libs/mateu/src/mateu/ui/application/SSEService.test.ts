// @vitest-environment jsdom
// The subject is a browser fetch reading browser storage, so this file opts into jsdom rather
// than the suite's default node environment.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sseService } from './SSEService.ts'

/** Drives runAction far enough to reach the fetch, and hands back the init it was called with. */
async function callAndCaptureInit(route = 'processes'): Promise<RequestInit> {
    const fetchMock = vi.fn().mockResolvedValue({ body: null })
    vi.stubGlobal('fetch', fetchMock)

    await sseService.runAction(
        // The api client is only used by the non-SSE path, so a bare cast is enough here.
        {} as never,
        '/_workflow', route, '/processes', 'refresh', 'initiator-id',
        {}, 'io.mateu.Some', {}, {},
        // background: true, so nothing is dispatched at the initiator before the fetch.
        document.createElement('div'), true,
        undefined, false, 'token',
    )

    expect(fetchMock).toHaveBeenCalledOnce()
    lastUrl = fetchMock.mock.calls[0][0] as string
    return fetchMock.mock.calls[0][1] as RequestInit
}

let lastUrl = ''

describe('SSEService', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    afterEach(() => vi.unstubAllGlobals())

    it('sends the auth token, so an SSE action is not the one anonymous request in the client', async () => {
        localStorage.setItem('__mateu_auth_token', 'a-jwt')

        const headers = (await callAndCaptureInit()).headers as Record<string, string>

        expect(headers['Authorization']).toBe('Bearer a-jwt')
        expect(headers['Accept']).toBe('text/event-stream')
    })

    it('sends the session id, like every other call the client makes', async () => {
        sessionStorage.setItem('__mateu_sesion_id', 'session-7')

        const headers = (await callAndCaptureInit()).headers as Record<string, string>

        expect(headers['X-Session-Id']).toBe('session-7')
    })

    it('omits both headers when there is nothing stored, rather than sending empty ones', async () => {
        const headers = (await callAndCaptureInit()).headers as Record<string, string>

        expect(headers).not.toHaveProperty('Authorization')
        expect(headers).not.toHaveProperty('X-Session-Id')
    })

    it('streams the root view of a mount too (empty route → _no_route), instead of doing nothing', async () => {
        await callAndCaptureInit('')

        expect(lastUrl).toBe('/_workflow/mateu/v3/sse/_no_route')
    })
})
