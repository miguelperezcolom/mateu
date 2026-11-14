// GA review 2 (release/docs and Explorer) findings still open on 3.0-rc.1 — pinned as `todo`: they
// report, they do not fail. Run: node --test scripts/ga-review2-docs.rc1reverify.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url).pathname
const read = (p) => readFileSync(root + p, 'utf8')

// Release S1: the Java CRUD guides still declare a user-typed id with no @EditableOnlyWhenCreating
// and a store keyed by it — since the technical-id rule, "New" has no id input and the create is refused.
const JAVA_CRUD_GUIDES = [
  'doc/src/content/docs/java-user-manual/use-cases/users-crud.md',
  'doc/src/content/docs/java-user-manual/advanced/rules.md',
  'doc/src/content/docs/java-user-manual/build/entity-interfaces.md',
  'doc/src/content/docs/java-user-manual/use-cases/nested-crud.md',
  'doc/src/content/docs/java-user-manual/build/master-detail.md',
]
test('GA r2 release S1: the Java CRUD guides say who assigns the id of a new record', { todo: 'open on rc.1' }, () => {
  for (const p of JAVA_CRUD_GUIDES) {
    const text = read(p)
    assert.match(text, /EditableOnlyWhenCreating|assigns? (the|its) id|technical id/i, p)
  }
})

// Release B-2: the NuGet packages carry no LICENSE / NOTICE file.
test('GA r2 ports B-2: the .NET packages pack LICENSE.txt and NOTICE', { todo: 'open on rc.1' }, () => {
  const props = read('backend/dotnet/Directory.Build.props')
  assert.match(props, /LICENSE\.txt[^>]*Pack="true"/)
  assert.match(props, /NOTICE[^>]*Pack="true"/)
})

// Explorer N7: the README's Status says 6 entries declare a known bug; the entries hold 4.
test('GA r2 Explorer N7: the Explorer README counts the known issues the entries declare', { todo: 'open on rc.1' }, () => {
  assert.doesNotMatch(read('demo/demo-explorer/README.md'), /\*\*6 entries declare a known Mateu bug\*\*/)
})

// Explorer N6: the conformance table still claims 1.4.3 Supports for Vaadin and Redwood while its own
// gap list names contrast failures.
test('GA r2 Explorer N6: 1.4.3 is not claimed as Supports while contrast gaps are listed', { todo: 'open on rc.1' }, () => {
  const row = read('doc/src/content/docs/quality/accessibility-conformance.md').split('\n').find((l) => l.includes('1.4.3 Contrast'))
  assert.ok(row && !/\|\s*S\s*\|\s*S\s*\|/.test(row), row)
})
