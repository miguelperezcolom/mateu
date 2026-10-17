// @vitest-environment jsdom
import { expect, it } from 'vitest'

// The renderer that emits <vaadin-grid-column-group> must also register it: nothing else imported
// it, so a column group's header rendered EMPTY in the browser (e2e grid-column-groups.spec.ts).
// No stubs here — renderColumn.test.ts stands plain elements in for the column tags.
it('importing the column renderer registers vaadin-grid-column-group', async () => {
    await import('./renderColumn')
    expect(customElements.get('vaadin-grid-column-group')).toBeDefined()
})
