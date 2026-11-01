import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { interpolateUrl } from './interpolation'

/**
 * The direct leg of the source-template corpus (conformance/client/source-templates.json): the
 * browser must send the URL the server's proxy would (Java SourceTemplateCorpusTest runs the same
 * file), so flipping a source to `proxy: true` changes nothing that is sent.
 */
interface Case { name: string; template: string; state: Record<string, unknown>; expected: string }
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/source-templates.json', import.meta.url)), 'utf8',
)) as { cases: Case[] }

describe('client conformance corpus — source templates (web, the direct leg)', () => {
    for (const c of corpus.cases) {
        it(c.name, () => expect(interpolateUrl(c.template, c.state as never)).toBe(c.expected))
    }
})
