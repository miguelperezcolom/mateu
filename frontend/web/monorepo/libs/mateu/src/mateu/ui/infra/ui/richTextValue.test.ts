import { describe, expect, it } from 'vitest'
import { deltaOps, deltaToHtml, richTextHtml } from './richTextValue'

describe('richTextHtml', () => {
    it('opens HTML as it is', () => {
        expect(richTextHtml('<p>Hi <b>there</b></p>')).toBe('<p>Hi <b>there</b></p>')
    })

    it('opens the Delta JSON the old Vaadin editor stored, in both shapes', () => {
        expect(richTextHtml('[{"insert":"Hi\\n"}]')).toBe('<p>Hi</p>')
        expect(richTextHtml('{"ops":[{"insert":"Hi","attributes":{"bold":true}},{"insert":"\\n"}]}'))
            .toBe('<p><strong>Hi</strong></p>')
    })

    it('keeps text that only looks like JSON as text', () => {
        expect(richTextHtml('[draft] notes')).toBe('[draft] notes')
        expect(richTextHtml('[1, 2, 3]')).toBe('[1, 2, 3]')
        expect(richTextHtml('[]')).toBe('[]')
    })

    it('treats an empty value as empty', () => {
        expect(richTextHtml(undefined)).toBe('')
        expect(richTextHtml(null)).toBe('')
        expect(deltaOps('')).toBeNull()
    })
})

describe('deltaToHtml', () => {
    it('carries inline marks and links, escaping text and refusing script links', () => {
        expect(deltaToHtml([
            { insert: 'a<b', attributes: { italic: true, underline: true } },
            { insert: ' ' },
            { insert: 'site', attributes: { link: 'https://mateu.io' } },
            { insert: ' ' },
            { insert: 'x', attributes: { link: 'javascript:alert(1)', strike: true } },
            { insert: '\n' },
        ])).toBe('<p><u><em>a&lt;b</em></u> <a href="https://mateu.io">site</a> <s>x</s></p>')
    })

    it('carries headings, quotes, code blocks and groups list lines', () => {
        expect(deltaToHtml([
            { insert: 'Title' }, { insert: '\n', attributes: { header: 2 } },
            { insert: 'one' }, { insert: '\n', attributes: { list: 'bullet' } },
            { insert: 'two' }, { insert: '\n', attributes: { list: 'bullet' } },
            { insert: 'first' }, { insert: '\n', attributes: { list: 'ordered' } },
            { insert: 'said' }, { insert: '\n', attributes: { blockquote: true } },
            { insert: 'x = 1' }, { insert: '\n', attributes: { 'code-block': true } },
        ])).toBe('<h2>Title</h2><ul><li>one</li><li>two</li></ul><ol><li>first</li></ol>'
            + '<blockquote>said</blockquote><pre><code>x = 1</code></pre>')
    })
})
