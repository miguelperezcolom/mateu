import { PageNode } from './pageModel'

/** A palette entry: a label and a factory that produces a fresh node to insert. */
export interface PaletteItem {
    label: string
    /** Category header for grouping in the palette. */
    group: 'Layout' | 'Form' | 'Content'
    create: () => PageNode
}

/**
 * The component catalog. Mirrors the Swing PaletteSnippets set for now (component-tree level:
 * layouts, form fields, buttons, text). Grow this as the editor gains coverage.
 */
export const CATALOG: PaletteItem[] = [
    { label: 'Vertical layout', group: 'Layout', create: () => ({ type: 'VerticalLayout', spacing: true, padding: true, content: [] }) },
    { label: 'Horizontal layout', group: 'Layout', create: () => ({ type: 'HorizontalLayout', spacing: true, content: [] }) },
    { label: 'Form layout', group: 'Layout', create: () => ({ type: 'FormLayout', content: [] }) },
    { label: 'Card', group: 'Layout', create: () => ({ type: 'Card', content: [] }) },

    { label: 'Field', group: 'Form', create: () => ({ type: 'FormField', id: 'fieldId', label: 'Label', dataType: 'string' }) },
    { label: 'Button', group: 'Form', create: () => ({ type: 'Button', label: 'Button', actionId: 'actionId' }) },

    { label: 'Text', group: 'Content', create: () => ({ type: 'Text', text: 'Text' }) },
    { label: 'Heading', group: 'Content', create: () => ({ type: 'Text', text: 'Heading', container: 'h2' }) },
]

/** A reasonable starter page, used when the editor opens with no source. */
export const SAMPLE_YAML = `type: VerticalLayout
spacing: true
padding: true
content:
  - type: Text
    text: "New page"
    container: h2
  - type: FormLayout
    content:
      - type: FormField
        id: name
        label: "Name"
        dataType: string
      - type: FormField
        id: email
        label: "Email"
        dataType: string
        stereotype: email
  - type: HorizontalLayout
    spacing: true
    content:
      - type: Button
        label: "Save"
        actionId: save
        buttonStyle: primary
      - type: Button
        label: "Cancel"
        actionId: cancel
        buttonStyle: secondary
`
