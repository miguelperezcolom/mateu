import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { staticAnswerOf } from './staticFiles'

describe('the Redwood canvas, served by the loopback server', () => {
    let media: string
    beforeAll(() => {
        media = mkdtempSync(join(tmpdir(), 'mateu-media-'))
        mkdirSync(join(media, 'assets'))
        mkdirSync(join(media, 'redwood', '_redwood'), { recursive: true })
        writeFileSync(join(media, 'redwood-preview.html'), '<!doctype html>')
        writeFileSync(join(media, 'assets', 'redwood-preview-x.js'), '')
        writeFileSync(join(media, 'redwood', '_index.html'), '')
        writeFileSync(join(media, 'redwood', '_redwood', 'app-flow.json'), '{}')
    })

    it('serves the canvas page, its module and the bundled Redwood app from media/', () => {
        expect(staticAnswerOf(media, '/redwood-preview.html')).toMatchObject({ kind: 'file', contentType: 'text/html; charset=utf-8' })
        expect(staticAnswerOf(media, '/assets/redwood-preview-x.js')).toMatchObject({ kind: 'file', contentType: 'text/javascript; charset=utf-8' })
        expect(staticAnswerOf(media, '/redwood/_redwood/app-flow.json?v=1')).toMatchObject({ kind: 'file', contentType: 'application/json' })
    })

    it('asks the backend for a Redwood file the bundle does not carry (its own Redwood app, at its root)', () => {
        expect(staticAnswerOf(media, '/redwood/_redwood/bundles/vb-app-bundle.js?v=2')).toEqual({ kind: 'backend', path: '/_redwood/bundles/vb-app-bundle.js?v=2' })
        expect(staticAnswerOf(undefined, '/redwood/_index.html')).toEqual({ kind: 'backend', path: '/_index.html' })
    })

    it('serves nothing else, and never outside media/', () => {
        expect(staticAnswerOf(media, '/index.html')).toEqual({ kind: 'none' }) // the webview loads the editor itself
        expect(staticAnswerOf(media, '/assets/../../etc/passwd')).toEqual({ kind: 'none' })
        expect(staticAnswerOf(media, '/redwood/%2e%2e/secret')).toEqual({ kind: 'none' })
        expect(staticAnswerOf(media, '/assets/missing.js')).toEqual({ kind: 'none' })
    })
})
