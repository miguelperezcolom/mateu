import { describe, expect, it } from 'vitest'
import { inlineForCanvas, resolveForCanvas, translateForCanvas } from './canvasReferences'
import { inlineReferences } from './inlineReferences'

// The offline canvas (no backend) used to paint a `type: Partial` / `type: ComponentRef` as an
// "Unknown metadata type" placeholder and a `${i18n.key}` as the key — Play and Export resolved
// both from the project's files, the canvas did not, because inlining would have broken the
// `ve-<path>` ids click-to-select maps a click through. The inlined roots now carry the
// reference's id: a partial is one selectable node on the canvas.

const files = [
    { path: 'specs/ui/partials/address.yaml', content: 'content:\n  - {type: FormField, id: street, label: "${i18n.street}"}\n  - {type: Text, text: "${i18n.hint}"}\n' },
    { path: 'specs/ui/partials/note.yaml', content: 'type: Text\ntext: one note\n' },
    { path: 'specs/ui/components.yaml', content: 'components:\n  - name: price\n    component: {type: Text, text: "${i18n.price}"}\n' },
    { path: 'specs/ui/translations/en.yaml', content: 'type: Translations\nlocale: en\nmessages:\n  street: Street\n  hint: Where we deliver\n  price: Price\n  title: Checkout\n' },
    { path: 'specs/ui/translations/es.yaml', content: 'type: Translations\nlocale: es\nmessages:\n  street: Calle\n  title: Pago\n' },
]

// what decorateForPreview hands the canvas: every document node stamped with its path id
const page = {
    type: 'VerticalLayout', id: 've-', title: '${i18n.title}',
    content: [
        { type: 'Partial', ref: 'address', id: 've-0' },
        { type: 'Partial', ref: 'note', id: 've-1' },
        { type: 'ComponentRef', ref: 'price', id: 've-2' },
        { type: 'Partial', ref: 'missing', id: 've-3' },
    ],
}

describe('the offline canvas resolves references and translations', () => {
    it('inlines partials and component refs, the inlined roots carrying the reference id (one selectable node)', () => {
        const out = inlineForCanvas(page, files) as any
        const content = out.content as any[]
        // address: two components spliced; the FormField keeps its own id (its binding), the Text takes ve-0
        expect(content[0]).toMatchObject({ type: 'FormField', id: 'street' })
        expect(content[1]).toMatchObject({ type: 'Text', text: '${i18n.hint}', id: 've-0' })
        // note: a single component, stamped with the reference's id
        expect(content[2]).toEqual({ type: 'Text', text: 'one note', id: 've-1' })
        // a business component likewise
        expect(content[3]).toEqual({ type: 'Text', text: '${i18n.price}', id: 've-2' })
        // a reference nothing resolves is left as it was (the expander shows its placeholder)
        expect(content[4]).toEqual({ type: 'Partial', ref: 'missing', id: 've-3' })
        // the document's own nodes keep their ids
        expect(out.id).toBe('ve-')
    })

    it('Play and Export keep inlining without the canvas ids', () => {
        const out = inlineReferences(page, files) as any
        expect(out.content[2]).toEqual({ type: 'Text', text: 'one note' })
    })

    it('translates texts for the preferred locale, falling back to en, and never touches ids', () => {
        const es = translateForCanvas(page, files, ['es-ES']) as any
        expect(es.title).toBe('Pago')
        expect(es.content[0].id).toBe('ve-0')
        const whole = resolveForCanvas(page, files, ['es']) as any
        expect(whole.content[0]).toMatchObject({ label: 'Calle' })
        expect(whole.content[1]).toMatchObject({ text: 'Where we deliver', id: 've-0' }) // missing in es: en
        expect(whole.content[3]).toMatchObject({ text: 'Price', id: 've-2' })
    })

    it('a project with no partials and no catalogues leaves the definition as it is', () => {
        expect(resolveForCanvas(page, [])).toBe(page)
        expect(translateForCanvas(page, [{ path: 'specs/ui/page.yaml', content: 'type: Text' }])).toBe(page)
    })
})
