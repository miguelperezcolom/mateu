// The component catalog + typed property specs now come from the generated schema — see
// componentSchema.ts / schemaCatalog.ts. This file keeps only the starter page.

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
