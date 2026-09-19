/**
 * Starter templates for the "new from template" gallery (visual-editor Phase 6). Each is a valid
 * page LAYOUT the backend renders through `__preview__` (no data needed) — a 10-second on-ramp that
 * drops a skeleton you then edit, instead of starting from a blank page.
 *
 * These are plain layout YAML (renderer-neutral, classless): they carry no view model, so they work
 * with any preview source and export to a static bundle. The "Named-slot template" showcases the
 * coherence Phase 4 primitive (a ResponsiveGrid with `gridTemplateAreas` + `Slotted` children).
 */
export interface StarterTemplate {
    id: string
    label: string
    description: string
    yaml: string
}

export const TEMPLATES: StarterTemplate[] = [
    {
        id: 'form',
        label: 'Form',
        description: 'A stack of fields with a Save button.',
        yaml: `type: VerticalLayout
content:
  - type: FormField
    id: name
    label: Name
  - type: FormField
    id: email
    label: Email
  - type: Button
    label: Save
    actionId: save
`,
    },
    {
        id: 'listing',
        label: 'Listing',
        description: 'A table with columns — the start of a list screen.',
        yaml: `type: Listing
title: Items
columns:
  - type: GridColumn
    id: name
    label: Name
  - type: GridColumn
    id: status
    label: Status
`,
    },
    {
        id: 'split',
        label: 'Two columns',
        description: 'A sidebar beside the main content.',
        yaml: `type: HorizontalLayout
content:
  - type: VerticalLayout
    content:
      - type: Text
        text: Sidebar
  - type: VerticalLayout
    content:
      - type: Text
        text: Main content
`,
    },
    {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'A title over a row of panels.',
        yaml: `type: VerticalLayout
content:
  - type: Text
    text: Dashboard
  - type: HorizontalLayout
    content:
      - type: VerticalLayout
        content:
          - type: Text
            text: Panel A
      - type: VerticalLayout
        content:
          - type: Text
            text: Panel B
      - type: VerticalLayout
        content:
          - type: Text
            text: Panel C
`,
    },
    {
        id: 'template',
        label: 'Named-slot template',
        description: 'A grid skeleton (header / sidebar / main) using named slots.',
        yaml: `type: ResponsiveGrid
gridTemplateAreas: '"header header" "sidebar main"'
content:
  - type: Slotted
    slot: header
    content:
      type: Text
      text: Header
  - type: Slotted
    slot: sidebar
    content:
      type: Text
      text: Sidebar
  - type: Slotted
    slot: main
    content:
      type: Text
      text: Main
`,
    },
]
