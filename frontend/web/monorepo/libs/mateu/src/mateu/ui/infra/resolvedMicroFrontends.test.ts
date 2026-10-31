import { describe, expect, it } from 'vitest'
import { withoutResolvedMicroFrontends } from './resolvedMicroFrontends'

describe('withoutResolvedMicroFrontends', () => {
    it('drops the remote answer of every micro frontend, deep, and keeps everything else', () => {
        const tree = {
            type: 'ClientSide',
            metadata: { type: 'VerticalLayout' },
            children: [
                { type: 'ClientSide', metadata: { type: 'MicroFrontend', baseUrl: 'https://r', route: '/x', resolved: { fragments: [1] } } },
                { type: 'ClientSide', metadata: { type: 'Text', text: 'hi' } },
            ],
        }
        const stripped = withoutResolvedMicroFrontends(tree)
        expect(stripped.children[0].metadata).toEqual({ type: 'MicroFrontend', baseUrl: 'https://r', route: '/x' })
        expect(stripped.children[1]).toBe(tree.children[1])
        expect(tree.children[0].metadata).toHaveProperty('resolved')
    })

    it('returns the same object when there is nothing resolved', () => {
        const tree = { type: 'ClientSide', metadata: { type: 'MicroFrontend', baseUrl: 'https://r' }, children: [] }
        expect(withoutResolvedMicroFrontends(tree)).toBe(tree)
    })
})
