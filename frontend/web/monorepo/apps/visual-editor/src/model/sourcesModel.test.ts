import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { parseSampleText, parseSourcesDoc, sampleText, serializeSourcesDoc } from './sourcesModel'
import { writePreserving } from './yamlPreserve'

const SRC = `$schema: x
# the catalogue
sources:
  - name: people
    description: Characters
    source:
      url: https://api/people?q=\${state.q}
      itemsPath: content
      headers: {X-Api-Key: k}
    totalPath: totalElements
    fields: {homeworld: planet.name}
`

describe('sources catalogue', () => {
    it('round-trips every key, shown or not', () => {
        expect(parse(serializeSourcesDoc(parseSourcesDoc(SRC)))).toEqual(parse(SRC))
    })
    it('edits a url and adds a source, keeping the comments', () => {
        const doc = parseSourcesDoc(SRC)
        doc.rows[0].url = 'https://api/v2/people'
        doc.rows.push({ name: 'planets', url: 'https://api/planets', extra: {}, sourceExtra: {} })
        const out = writePreserving(SRC, parse(serializeSourcesDoc(doc)))
        expect(out).toContain('# the catalogue')
        const v = parse(out)
        expect(v.sources[0].source).toEqual({ url: 'https://api/v2/people', itemsPath: 'content', headers: { 'X-Api-Key': 'k' } })
        expect(v.sources[1]).toEqual({ name: 'planets', source: { url: 'https://api/planets' } })
    })
})

describe('sources.yaml — sample data', () => {
    it('round-trips sample and sampleFile as entry keys', () => {
        const yaml = 'sources:\n  - name: o\n    source: {url: /o}\n    sample:\n      data: [{id: 1}]\n    sampleFile: fixtures/o.json\n'
        const doc = parseSourcesDoc(yaml)
        expect(doc.rows[0].sample).toEqual({ data: [{ id: 1 }] })
        expect(doc.rows[0].sampleFile).toBe('fixtures/o.json')
        expect(doc.rows[0].extra).toEqual({})
        const again = parseSourcesDoc(serializeSourcesDoc(doc))
        expect(again.rows[0].sample).toEqual({ data: [{ id: 1 }] })
        expect(again.rows[0].sampleFile).toBe('fixtures/o.json')
    })

    it('the sample box takes JSON or YAML, blank clears it, and broken text is an error', () => {
        expect(parseSampleText('{"data": [1]}')).toEqual({ sample: { data: [1] } })
        expect(parseSampleText('data:\n  - 1\n')).toEqual({ sample: { data: [1] } })
        expect(parseSampleText('  ')).toEqual({ sample: undefined })
        expect(parseSampleText('data: [').error).toBeTruthy()
        expect(sampleText(undefined)).toBe('')
        expect(sampleText({ a: 1 })).toBe('a: 1')
    })
})
