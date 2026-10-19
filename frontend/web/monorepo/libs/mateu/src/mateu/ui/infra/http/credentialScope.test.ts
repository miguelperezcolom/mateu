// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { configureCredentialOrigins, credentialHeadersFor, mayCarryCredentials, originOf, resetCredentialScope,
    trustDeclaredRemotes, trustRootBaseUrl } from './credentialScope'
import { setAuthToken } from './authToken'

afterEach(() => {
    resetCredentialScope()
    setAuthToken(null)
    document.head.innerHTML = ''
})

describe('credentialScope (M-S5)', () => {
    it('the page origin and relative urls are trusted; another origin is not until configured', () => {
        expect(mayCarryCredentials('/mateu/v3/sync/x')).toBe(true)
        expect(mayCarryCredentials(location.origin + '/x')).toBe(true)
        expect(mayCarryCredentials('https://other.example/x')).toBe(false)
        expect(mayCarryCredentials('javascript:alert(1)')).toBe(false)
        configureCredentialOrigins(['https://other.example/', 'not a url'])
        expect(mayCarryCredentials('https://other.example/mateu')).toBe(true)
    })

    it('the top-level mateu-ui base url and the meta tag are ROOT origins', () => {
        trustRootBaseUrl('http://localhost:8080')
        expect(mayCarryCredentials('http://localhost:8080/mateu/v3/sync/a')).toBe(true)
        const meta = document.createElement('meta')
        meta.name = 'mateu-credential-origins'
        meta.content = 'https://a.example, https://b.example'
        document.head.appendChild(meta)
        resetCredentialScope()
        expect(mayCarryCredentials('https://b.example/x')).toBe(true)
    })

    it('a remote a ROOT app names is trusted; the remotes a remote names are not', () => {
        trustDeclaredRemotes('', ['https://forms.example', undefined])
        trustDeclaredRemotes('https://forms.example', ['https://attacker.example'])
        expect(mayCarryCredentials('https://forms.example/x')).toBe(true)
        expect(mayCarryCredentials('https://attacker.example/x')).toBe(false)
        // a declared remote can not promote another remote by being named as its declarer
        trustDeclaredRemotes('https://attacker.example', ['https://evil.example'])
        expect(mayCarryCredentials('https://evil.example')).toBe(false)
    })

    it('credentialHeadersFor gives a bare fetch the same rule', () => {
        setAuthToken('t')
        expect(credentialHeadersFor('/mateu/v3/sse/x').Authorization).toBe('Bearer t')
        expect(credentialHeadersFor('https://attacker.example/sse')).toEqual({})
    })

    it('originOf resolves against the page and refuses non-http schemes', () => {
        expect(originOf('/a')).toBe(location.origin)
        expect(originOf('data:text/html,x')).toBeUndefined()
        expect(originOf(undefined)).toBeUndefined()
    })

    it('R4: a backslash or a tab does not make another origin "relative": the url is resolved as the browser does', () => {
        for (const foreign of ['\\\\attacker.example/x', '/\\attacker.example/x', '\\/attacker.example/x', '/\t/attacker.example/x', ' //attacker.example/x']) {
            expect(originOf(foreign), JSON.stringify(foreign)).toBe('http://attacker.example')
            expect(mayCarryCredentials(foreign)).toBe(false)
        }
        expect(mayCarryCredentials('/mateu/v3/sync/x')).toBe(true)
    })
})
