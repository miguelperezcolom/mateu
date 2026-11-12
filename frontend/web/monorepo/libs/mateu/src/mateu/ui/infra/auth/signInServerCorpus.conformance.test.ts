// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readSignInConfig } from './signInConfig'

/**
 * The SERVER corpus (conformance/client/sign-in.json, written by Java and held by .NET and Python):
 * every meta a server emits must be understood by this client — each web provider the server put in
 * the meta survives the client's parsing, in the same order. Keeps the two halves of the contract
 * (server-built meta, client-read meta) from drifting apart.
 */
const corpus = JSON.parse(readFileSync(
    // jsdom gives import.meta.url an http scheme: resolve from the package (vitest's cwd)
    resolve(process.cwd(), '../../../../../conformance/client/sign-in.json'), 'utf8',
)) as { cases: { name: string, meta: string | null }[] }

describe('the client reads every meta the servers emit', () => {
    for (const c of corpus.cases.filter((x) => x.meta)) {
        it(c.name, () => {
            // the tag exactly as the server writes it, read the way the page reads it
            const doc = new DOMParser().parseFromString('<html><head>' + c.meta + '</head><body></body></html>', 'text/html')
            const content = doc.querySelector('meta[name="mateu-auth"]')!.getAttribute('content')!
            const raw = JSON.parse(content) as { providers?: { id: string }[] }
            const config = readSignInConfig(doc)
            expect(config?.providers.map((p) => p.id) ?? []).toEqual((raw.providers ?? []).map((p) => p.id))
        })
    }
})
