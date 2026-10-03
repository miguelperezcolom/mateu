import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { parseSourcesDoc, serializeSourcesDoc } from './sourcesModel'
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
