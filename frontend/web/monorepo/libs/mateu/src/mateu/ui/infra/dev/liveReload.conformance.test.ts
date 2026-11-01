import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { decideLiveReload, LiveReloadMessage } from './liveReloadPolicy'

/**
 * The live-reload corpus (conformance/client/live-reload.json): what a dev event means for the screen.
 * This is the reference; React Native and the IntelliJ plugin run the same file.
 */
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/live-reload.json', import.meta.url)), 'utf8',
)) as { cases: { name: string; message: LiveReloadMessage | null; known: string | null; expect: { action: string; bootId: string | null } }[] }

describe('live reload conformance', () => {
    for (const c of corpus.cases) {
        it(c.name, () => {
            const d = decideLiveReload(c.message ?? undefined, c.known ?? undefined)
            expect({ action: d.action, bootId: d.bootId ?? null }).toEqual(c.expect)
        })
    }
})
