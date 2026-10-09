import { describe, it, expect } from 'vitest'
import { parsePage } from './pageModel'
import { collectNotes, buildViewModelPrompt } from './notes'

const yaml = `type: Form
title: Customer
note: Creating and editing a customer.
toolbar:
  - type: Button
    label: Save
    actionId: save
    note: Persist, then go back to the list.
content:
  - type: FormField
    id: email
    label: Email
    note: Must be unique among customers.
  - type: FormField
    id: name
    label: Name
`

describe('collectNotes', () => {
    it('finds every note in reading order, slots included, each with what it is about', () => {
        const notes = collectNotes(parsePage(yaml))
        expect(notes.map((n) => [n.type, n.name, n.note])).toEqual([
            ['Form', 'Customer', 'Creating and editing a customer.'],
            ['Button', 'Save', 'Persist, then go back to the list.'],
            ['FormField', 'email', 'Must be unique among customers.'],
        ])
        expect(notes[1].path).toEqual(['toolbar.0'])
        expect(notes[2].path).toEqual([0])
    })
    it('ignores blank notes and a page with none', () => {
        expect(collectNotes(parsePage('type: Text\nnote: "  "\n'))).toEqual([])
        expect(collectNotes(undefined)).toEqual([])
    })
})

describe('buildViewModelPrompt', () => {
    const notes = collectNotes(parsePage(yaml))
    it('asks for the class, ties each note to its component and carries the layout', () => {
        const p = buildViewModelPrompt({ yaml, path: 'customer.yaml', route: 'customers/new', notes })
        expect(p).toContain('Write the Java view model')
        expect(p).toContain('specs/ui/customer.yaml')
        expect(p).toContain('- The page (Form `Customer`): Creating and editing a customer.')
        expect(p).toContain('- FormField `email`: Must be unique among customers.')
        expect(p).toContain('for route `customers/new`')
        expect(p).toContain('```yaml\ntype: Form')
    })
    it('completes an existing view model instead of binding a new one', () => {
        const p = buildViewModelPrompt({ yaml, viewModel: 'com.acme.CustomerForm', notes: [] })
        expect(p).toContain('Complete the Mateu view model `com.acme.CustomerForm`')
        expect(p).not.toContain('routes.yaml')
        expect(p).toContain('carries no design notes')
    })
})
