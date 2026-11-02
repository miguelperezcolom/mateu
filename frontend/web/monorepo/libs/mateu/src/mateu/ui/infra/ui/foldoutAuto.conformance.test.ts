import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { foldoutOpenStates, FoldoutFitOptions, FoldoutFitPanel } from './foldoutGeometry'

/**
 * The foldout auto-open corpus (conformance/client/foldout-auto.json): which panels are open on
 * first paint when the author left `open` undecided. Redwood, React Native and IntelliJ run the
 * same file.
 */
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/foldout-auto.json', import.meta.url)), 'utf8',
)) as {
    defaults: FoldoutFitOptions
    cases: { name: string; available: number | null; options?: FoldoutFitOptions; panels: FoldoutFitPanel[]; expected: boolean[] }[]
}

describe('foldout auto-open conformance', () => {
    for (const c of corpus.cases) {
        it(c.name, () => {
            expect(foldoutOpenStates(c.panels, c.available, { ...corpus.defaults, ...c.options })).toEqual(c.expected)
        })
    }
})
