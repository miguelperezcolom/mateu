import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSignInConfig } from './signInConfig'

/**
 * The SERVER corpus (conformance/client/sign-in.json, written by Java and held by .NET and Python):
 * every meta a server emits must be understood by this client — each web provider the server put in
 * the meta survives the client's parsing, in the same order. Keeps the two halves of the contract
 * (server-built meta, client-read meta) from drifting apart.
 */
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/sign-in.json', import.meta.url)), 'utf8',
)) as { cases: { name: string, meta: string | null }[] }

const unescapeHtml = (s: string) => s
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

describe('the client reads every meta the servers emit', () => {
    for (const c of corpus.cases.filter((x) => x.meta)) {
        it(c.name, () => {
            const raw = JSON.parse(unescapeHtml(c.meta!)) as { providers?: { id: string }[] }
            const config = parseSignInConfig(raw)
            expect(config?.providers.map((p) => p.id) ?? []).toEqual((raw.providers ?? []).map((p) => p.id))
        })
    }
})
