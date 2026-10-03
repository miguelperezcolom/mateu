import { describe, it, expect } from 'vitest'
import { connectSrc, sourceOrigins } from './csp'

describe('webview connect-src', () => {
    it('collects the origins of the declared REST sources, and nothing else', () => {
        const origins = sourceOrigins([
            `sources:
  - name: people
    source:
      url: >-
        https://swapi.ec1.mateu.io/api/people?page=\${state.page ?? 0}
  - name: vcn
    source: {url: "http://localhost:8790/api/vcns/\${state.id}"}
  - name: dynamic
    source: {url: "https://\${env.host}/x"}
  - name: relative
    source: {url: /api/local}
`,
            'type: Form\ntitle: not a sources file\n',
            ': : broken',
        ])
        expect(origins).toEqual(['http://localhost:8790', 'https://swapi.ec1.mateu.io'])
    })

    it('is the proxy, loopback, the backend origin and the source origins — never a bare https:', () => {
        const csp = connectSrc('http://127.0.0.1:5000', 'https://demo.mateu.io/app', ['https://api.example.com'])
        expect(csp.split(' ')).toContain('https://demo.mateu.io')
        expect(csp.split(' ')).toContain('https://api.example.com')
        expect(csp.split(' ')).toContain('http://localhost:*')
        expect(csp.split(' ')).not.toContain('https:')
        expect(csp.split(' ')).not.toContain('http:')
    })
})
