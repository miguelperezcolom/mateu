import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import {
    parsePage, serializePage, nodeAt, isContainer,
    insertAt, insertAfter, removeAt, reorder, moveNode, isPrefix,
    pathToId, idToPath, decorateForPreview,
    PageDoc, PageNode,
} from './pageModel'

const layout = (yaml: string): PageDoc => parsePage(yaml)

describe('parsePage', () => {
    it('reads the envelope form (modelView + layout)', () => {
        const doc = parsePage('modelView: com.example.View\nlayout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: hi\n')
        expect(doc.modelView).toBe('com.example.View')
        expect(doc.bare).toBe(false)
        expect(doc.layout.type).toBe('VerticalLayout')
        expect(doc.layout.content).toHaveLength(1)
    })

    it('reads a bare component tree (no envelope)', () => {
        const doc = parsePage('type: HorizontalLayout\ncontent:\n  - type: Button\n')
        expect(doc.modelView).toBeUndefined()
        expect(doc.bare).toBe(true)
        expect(doc.layout.type).toBe('HorizontalLayout')
    })

    it('treats empty / whitespace / comment-only as an empty editable page', () => {
        for (const src of ['', '   \n  ', '# just a comment\n']) {
            const doc = parsePage(src)
            expect(doc.layout).toEqual({ type: 'VerticalLayout', content: [] })
            expect(doc.bare).toBe(true)
        }
    })

    it('falls back to an empty page on malformed YAML instead of throwing', () => {
        const doc = parsePage(':\n  - : :\n bad')
        expect(doc.layout.type).toBe('VerticalLayout')
    })
})

describe('serializePage', () => {
    it('round-trips an envelope document', () => {
        const src = 'modelView: com.example.View\nlayout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: hi\n'
        const doc = parsePage(src)
        const out = serializePage(doc)
        expect(out).toContain('modelView: com.example.View')
        expect(out).toContain('layout:')
        expect(parsePage(out)).toEqual(doc)
    })

    it('serializes a bare document without an envelope', () => {
        const doc = parsePage('type: VerticalLayout\ncontent:\n  - type: Text\n')
        const out = serializePage(doc)
        expect(out.startsWith('type: VerticalLayout')).toBe(true)
        expect(out).not.toContain('layout:')
    })
})

describe('decorateForPreview', () => {
    const doc = layout('type: VerticalLayout\ncontent:\n  - type: Text\n    text: a\n  - type: HorizontalLayout\n    content:\n      - type: Button\n        label: ok\n')

    it('stamps a synthetic ve-<path> id on every node', () => {
        const tree = parse(decorateForPreview(doc)) as any
        expect(tree.id).toBe('ve-root')
        expect(tree.content[0].id).toBe('ve-0')
        expect(tree.content[1].id).toBe('ve-1')
        expect(tree.content[1].content[0].id).toBe('ve-1-0')
    })

    it('strips empty content arrays (a Card content:[] breaks the backend deserializer)', () => {
        const withEmpties = layout('type: VerticalLayout\ncontent:\n  - type: Card\n    content: []\n  - type: Text\n    text: x\n')
        const tree = parse(decorateForPreview(withEmpties)) as any
        // The Card keeps its type/id but loses the empty content key.
        expect(tree.content[0].type).toBe('Card')
        expect('content' in tree.content[0]).toBe(false)
        // A non-empty container keeps its content.
        expect(tree.content[1].type).toBe('Text')
    })

    it('does not mutate the source document', () => {
        const before = JSON.stringify(doc)
        decorateForPreview(doc)
        expect(JSON.stringify(doc)).toBe(before)
    })
})

describe('path addressing', () => {
    it('pathToId / idToPath round-trip', () => {
        expect(pathToId([])).toBe('ve-root')
        expect(pathToId([0, 2])).toBe('ve-0-2')
        expect(idToPath('ve-root')).toEqual([])
        expect(idToPath('ve-0-2')).toEqual([0, 2])
        expect(idToPath('not-ve')).toBeNull()
        expect(idToPath(undefined)).toBeNull()
    })

    it('nodeAt resolves the root and nested nodes', () => {
        const doc = layout('type: VerticalLayout\ncontent:\n  - type: FormLayout\n    content:\n      - type: FormField\n        id: name\n')
        expect(nodeAt(doc, [])!.type).toBe('VerticalLayout')
        expect(nodeAt(doc, [0])!.type).toBe('FormLayout')
        expect((nodeAt(doc, [0, 0]) as PageNode).id).toBe('name')
        expect(nodeAt(doc, [9])).toBeUndefined()
    })

    it('isContainer recognises layouts and cards', () => {
        expect(isContainer({ type: 'VerticalLayout' })).toBe(true)
        expect(isContainer({ type: 'Card' })).toBe(true)
        expect(isContainer({ type: 'Text', text: 'x' })).toBe(false)
    })
})

describe('edit operations', () => {
    const fresh = () => layout('type: VerticalLayout\ncontent:\n  - type: Text\n    text: a\n  - type: Text\n    text: b\n')

    it('insertAt inserts a child at an index', () => {
        const doc = fresh()
        const path = insertAt(doc, [], 1, { type: 'Button', label: 'x' })
        expect(path).toEqual([1])
        expect(doc.layout.content!.map((n) => n.type)).toEqual(['Text', 'Button', 'Text'])
    })

    it('insertAfter inserts as a following sibling', () => {
        const doc = fresh()
        insertAfter(doc, [0], { type: 'Button', label: 'x' })
        expect(doc.layout.content!.map((n) => (n as any).label ?? (n as any).text)).toEqual(['a', 'x', 'b'])
    })

    it('removeAt removes a node', () => {
        const doc = fresh()
        removeAt(doc, [0])
        expect(doc.layout.content!.map((n) => (n as any).text)).toEqual(['b'])
    })

    it('reorder moves a node within its parent and clamps at the ends', () => {
        const doc = fresh()
        expect(reorder(doc, [0], 1)).toEqual([1])
        expect(doc.layout.content!.map((n) => (n as any).text)).toEqual(['b', 'a'])
        // Clamped: moving the first item up is a no-op.
        expect(reorder(doc, [0], -1)).toEqual([0])
    })
})

describe('moveNode', () => {
    it('moves a node into another container', () => {
        const doc = layout('type: VerticalLayout\ncontent:\n  - type: Text\n    text: a\n  - type: Card\n    content:\n      - type: Text\n        text: inside\n')
        // Move Text "a" ([0]) into the Card ([1]). Removing "a" shifts the Card to [0], so "a"
        // lands at [0, 0] — the returned path must reflect that shift.
        const np = moveNode(doc, [0], [1], 0)
        expect(np).toEqual([0, 0])
        expect(nodeAt(doc, [0])!.type).toBe('Card')
        expect((nodeAt(doc, [0, 0]) as any).text).toBe('a')
    })

    it('refuses to move a node into itself or its own subtree', () => {
        const doc = layout('type: VerticalLayout\ncontent:\n  - type: Card\n    content:\n      - type: Text\n        text: x\n')
        expect(moveNode(doc, [0], [0], 0)).toBeNull()      // into itself
        expect(moveNode(doc, [0], [0, 0], 0)).toBeNull()   // into a descendant
    })

    it('adjusts the target index when removing an earlier sibling shifts it', () => {
        const doc = layout('type: VerticalLayout\ncontent:\n  - type: Text\n    text: a\n  - type: Text\n    text: b\n  - type: Text\n    text: c\n')
        moveNode(doc, [0], [], 2) // move "a" to index 2 within the same parent
        expect(doc.layout.content!.map((n) => (n as any).text)).toEqual(['b', 'a', 'c'])
    })
})

describe('isPrefix', () => {
    it('detects ancestor paths', () => {
        expect(isPrefix([], [0, 1])).toBe(true)
        expect(isPrefix([0], [0, 1])).toBe(true)
        expect(isPrefix([0, 1], [0, 1])).toBe(true)
        expect(isPrefix([0, 1], [0])).toBe(false)
        expect(isPrefix([1], [0, 1])).toBe(false)
    })
})

describe('partials (content-list fragments)', () => {
    const src = 'content:\n  - type: FormField\n    id: street\n    label: Street\n  - type: FormField\n    id: city\n    label: City\n'

    it('parses a top-level content: list as a fragment wrapped for editing', () => {
        const doc = parsePage(src)
        expect(doc.fragment).toBe(true)
        expect(doc.layout.type).toBe('VerticalLayout') // synthetic editing root
        expect(doc.layout.content!.map((n) => (n as any).id)).toEqual(['street', 'city'])
    })

    it('serializes a fragment back to a bare content: list, NOT a VerticalLayout', () => {
        const doc = parsePage(src)
        const out = parse(serializePage(doc))
        expect(out.type).toBeUndefined()             // no wrapper leaked in
        expect(out.content.map((n: any) => n.id)).toEqual(['street', 'city'])
    })

    it('keeps the fragment shape after an edit', () => {
        const doc = parsePage(src)
        removeAt(doc, [1])                            // drop the "city" field
        const out = parse(serializePage(doc))
        expect(out.type).toBeUndefined()
        expect(out.content.map((n: any) => n.id)).toEqual(['street'])
    })

    it('a single bare component partial is not a fragment and round-trips as-is', () => {
        const doc = parsePage('type: Card\ncontent:\n  - type: Text\n    text: hi\n')
        expect(doc.fragment).toBeFalsy()
        const out = parse(serializePage(doc))
        expect(out.type).toBe('Card')
    })
})
