/**
 * The pure half of the "Mateu Sample Screens" command (the Figma half is in code.ts): six screens a
 * designer could have made with the published Mateu UI Kit, written as the instances they are made
 * of — which library component, which variant, which value in each property of the properties panel,
 * and which instances were dropped into each slot. Nothing else: no free-drawn layer, no renamed
 * layer, no `#config`. The command builds exactly this in a file that uses the library, and
 * design/figma/e2e builds the same screens as a Figma REST payload (the CI fixture) from it.
 *
 * `checkSamples` holds the plan to the contract and to `planEntry` (the properties and slots the
 * generator gives each component), so a plan naming a property, a variant value or a slot the
 * library does not have fails a test instead of failing silently in Figma. Tested with `node --test`.
 */

// `.ts` + `import type`: node --test runs this file with type stripping (no bundler in between)
import { planEntry } from './plan.ts'

export const SAMPLES_PAGE = 'Screens (sample)'

/** One library instance: the component, its variant, its property values and its slots' content. */
export interface InstancePlan {
  /** The contract name (`Mateu/Field/TextField`). */
  component: string
  /** Variant axis → value; axes not named keep the component set's default variant. */
  variants?: Record<string, string>
  /** Property NAME as Figma's properties panel shows it (`fieldId`, `label`, `required`) → value. */
  properties?: Record<string, string | boolean>
  /** Slot name (`content`, `toolbar`…) → the instances dropped into it, in order. */
  slots?: Record<string, InstancePlan[]>
}

export interface ScreenPlan {
  /** The top-level frame's name: the specs/ui file and, in the e2e app, the route. */
  name: string
  /** What the screen exercises (shown under the frame's name on the page). */
  description: string
  /** The frame's children, top to bottom. */
  instances: InstancePlan[]
}

// ── small builders, so the screens read like what a designer did ────────────────────────────────

const button = (label: string, style: 'primary' | 'secondary' | 'tertiary', to: { actionId?: string, route?: string }): InstancePlan => ({
  component: 'Mateu/Actions/Button',
  variants: { style },
  properties: { label, ...(to.actionId ? { actionId: to.actionId } : {}), ...(to.route ? { route: to.route } : {}) },
})

const textField = (fieldId: string, label: string, extra: Record<string, string | boolean> = {}): InstancePlan => ({
  component: 'Mateu/Field/TextField', properties: { fieldId, label, ...extra },
})

// body text: the set's default variant is size=xl (the first value), so a designer picks m
const text = (value: string, variants: Record<string, string> = { size: 'm' }): InstancePlan => ({
  component: 'Mateu/Display/Text', variants, properties: { text: value },
})

const section = (title: string, content: InstancePlan[]): InstancePlan => ({
  component: 'Mateu/Layout/Section', properties: { title }, slots: { content },
})

const propertyRow = (fieldId: string, label: string): InstancePlan => ({
  component: 'Mateu/Field/PropertyRow', properties: { fieldId, label },
})

const column = (columnId: string, label: string, extra: Record<string, string | boolean> = {}): InstancePlan => ({
  component: 'Mateu/Crud/GridColumn', properties: { columnId, label, ...extra },
})

const metric = (title: string, value: string, trendLabel: string): InstancePlan => ({
  component: 'Mateu/Display/MetricCard', properties: { title, value, trendLabel },
})

const card = (title: string, content: InstancePlan[]): InstancePlan => ({
  component: 'Mateu/Layout/Card', properties: { title }, slots: { content },
})

// ── the screens ─────────────────────────────────────────────────────────────────────────────────

export const SAMPLE_SCREENS: ScreenPlan[] = [
  {
    name: 'contact',
    description: 'A free form: a page header with Save/Cancel in its toolbar, two sections of fields',
    instances: [
      {
        component: 'Mateu/Page/Header',
        properties: { title: 'New contact', subtitle: 'Who should the gallery write to?' },
        slots: {
          toolbar: [
            button('Save', 'primary', { actionId: 'save' }),
            button('Cancel', 'secondary', { route: 'artworks' }),
          ],
        },
      },
      section('Contact details', [
        textField('name', 'Full name', { required: true, placeholder: 'Ada Lovelace' }),
        textField('email', 'Email', { required: true, placeholder: 'ada@example.com' }),
        { component: 'Mateu/Field/Select', variants: { stereotype: 'select' }, properties: { fieldId: 'country', label: 'Country' } },
        { component: 'Mateu/Field/Date', variants: { dataType: 'date' }, properties: { fieldId: 'birthDate', label: 'Birth date' } },
      ]),
      section('Membership', [
        { component: 'Mateu/Field/PlainText', variants: { dataType: 'money' }, properties: { fieldId: 'balance', label: 'Balance' } },
        { component: 'Mateu/Field/Checkbox', variants: { stereotype: 'checkbox' }, properties: { fieldId: 'newsletter', label: 'Send me the newsletter' } },
      ]),
    ],
  },
  {
    name: 'artwork',
    description: 'An Item overview page: photo, key facts in the body, tabs in the main slot',
    instances: [
      {
        component: 'Mateu/Page Templates/ItemOverviewPage',
        properties: { overline: 'Artwork', title: '${state.title}', subtitle: '${state.artist}', 'photo.src': '/images/artwork.svg' },
        slots: {
          toolbar: [
            button('Ask about it', 'primary', { route: 'contact' }),
            button('Back to artworks', 'secondary', { route: 'artworks' }),
          ],
          body: [propertyRow('artist', 'Artist'), propertyRow('year', 'Year'), propertyRow('location', 'Location')],
          content: [
            {
              component: 'Mateu/Layout/Tabs',
              properties: { tab1: 'Details', tab2: 'Story' },
              slots: {
                tabs: [
                  {
                    component: 'Mateu/Layout/Tab',
                    properties: { label: 'Details' },
                    slots: {
                      content: [
                        { component: 'Mateu/Field/PlainText', properties: { fieldId: 'medium', label: 'Medium' } },
                        { component: 'Mateu/Field/PlainText', properties: { fieldId: 'dimensions', label: 'Dimensions' } },
                      ],
                    },
                  },
                  {
                    component: 'Mateu/Layout/Tab',
                    properties: { label: 'Story' },
                    slots: { content: [text('Every work in the collection has a story; this tab tells it.')] },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  {
    name: 'artworks',
    description: 'A listing: a REST source, searchable, columns, and a row that opens the record',
    instances: [
      {
        component: 'Mateu/Crud/Listing',
        variants: { gridLayout: 'table' },
        properties: { title: 'Artworks', 'rowsSource.ref': 'artworks', rowRoute: 'artworks/${row.id}', searchable: true, pageSize: '10' },
        slots: {
          columns: [
            column('id', 'Id', { identifier: true }),
            column('title', 'Title'),
            column('artist', 'Artist'),
            column('year', 'Year', { dataType: 'integer' }),
          ],
        },
      },
    ],
  },
  {
    name: 'dashboard',
    description: 'A Dashboard landing page: KPI metric cards and panels',
    instances: [
      {
        component: 'Mateu/Page Templates/DashboardLandingPage',
        properties: { title: 'Gallery dashboard', subtitle: 'This month at a glance' },
        slots: {
          kpi: [metric('Visitors', '12,480', '+8% vs last month'), metric('Ticket sales', '84,300 €', '+3%'), metric('New members', '215', '-2%')],
          content: [
            { component: 'Mateu/Layout/DashboardPanel', properties: { title: 'Most viewed', subtitle: 'Top three works' }, slots: { content: [text('The Starry Night, The Kiss, Las Meninas')] } },
            { component: 'Mateu/Layout/DashboardPanel', properties: { title: 'Notes' }, slots: { content: [text('The east wing reopens on Monday.')] } },
          ],
        },
      },
    ],
  },
  {
    name: 'onboarding',
    description: 'A Guided process page with three steps',
    instances: [
      {
        component: 'Mateu/Page Templates/GuidedProcessPage',
        properties: { title: 'Join the gallery', subtitle: 'Three short steps' },
        slots: {
          toolbar: [button('Finish', 'primary', { route: 'welcome' })],
          steps: [
            {
              component: 'Mateu/Page Templates/GuidedProcessStep',
              properties: { id: 'account', title: 'Account', description: 'Who you are' },
              slots: { content: [textField('fullName', 'Full name'), textField('memberEmail', 'Email')] },
            },
            {
              component: 'Mateu/Page Templates/GuidedProcessStep',
              properties: { id: 'preferences', title: 'Preferences', description: 'What you like' },
              slots: { content: [{ component: 'Mateu/Field/Checkbox', variants: { stereotype: 'toggle' }, properties: { fieldId: 'guidedTours', label: 'Guided tours' } }] },
            },
            {
              component: 'Mateu/Page Templates/GuidedProcessStep',
              properties: { id: 'confirm', title: 'Confirm', description: 'All set' },
              slots: { content: [text('Press Finish to become a member.')] },
            },
          ],
        },
      },
    ],
  },
  {
    name: 'welcome',
    description: 'A Welcome page: a banner with three calls to action over two tiles',
    instances: [
      {
        component: 'Mateu/Page Templates/WelcomePage',
        variants: { backgroundColor: 'dark-ocean' },
        properties: { overline: 'Mateu gallery', title: 'Welcome to the gallery', subtitle: 'Browse the collection, check the numbers, or become a member.' },
        slots: {
          toolbar: [
            button('Browse artworks', 'primary', { route: 'artworks' }),
            button('Dashboard', 'secondary', { route: 'dashboard' }),
            button('Become a member', 'secondary', { route: 'onboarding' }),
          ],
          content: [
            card('Opening hours', [text('Tuesday to Sunday, 10:00 to 18:00.')]),
            card('Find us', [text('Paseo del Prado, Madrid.')]),
          ],
        },
      },
    ],
  },
]

/** Every library component the screens use (contract names, sorted). */
export function componentsUsed(screens: ScreenPlan[] = SAMPLE_SCREENS): string[] {
  const out = new Set<string>()
  const walk = (i: InstancePlan) => {
    out.add(i.component)
    for (const children of Object.values(i.slots ?? {})) children.forEach(walk)
  }
  for (const s of screens) s.instances.forEach(walk)
  return [...out].sort()
}

/**
 * What in the plan the library would not have (empty = buildable): an unknown component, a
 * variant axis or value it lacks, a property `planEntry` does not give it (or of the wrong type),
 * a slot it does not have. Paths read `screen > Component > slot > Component`.
 */
export function checkSamples(contract: { components: any[] }, screens: ScreenPlan[] = SAMPLE_SCREENS): string[] {
  const entries = new Map(contract.components.map((e: any) => [e.name, e]))
  const problems: string[] = []
  const check = (i: InstancePlan, path: string) => {
    const here = `${path} > ${i.component}`
    const entry = entries.get(i.component)
    if (!entry) {
      problems.push(`${here}: not a component of the library`)
      return
    }
    const plan = planEntry(entry)
    for (const [axis, value] of Object.entries(i.variants ?? {})) {
      const values: string[] | undefined = entry.variants?.[axis]
      if (!values) problems.push(`${here}: no variant axis "${axis}"`)
      else if (!values.includes(value)) problems.push(`${here}: ${axis}=${value} is not one of ${values.join(', ')}`)
    }
    for (const [name, value] of Object.entries(i.properties ?? {})) {
      const p = plan.properties.find((x) => x.name === name)
      if (!p) problems.push(`${here}: no property "${name}" (it has ${plan.properties.map((x) => x.name).join(', ') || 'none'})`)
      else if ((p.type === 'BOOLEAN') !== (typeof value === 'boolean')) problems.push(`${here}: "${name}" is a ${p.type} property`)
    }
    for (const [slot, children] of Object.entries(i.slots ?? {})) {
      if (!plan.slots.some((s) => s.name === slot)) problems.push(`${here}: no slot "${slot}" (it has ${plan.slots.map((s) => s.name).join(', ') || 'none'})`)
      children.forEach((c) => check(c, `${here} > ${slot}`))
    }
  }
  const names = new Set<string>()
  for (const s of screens) {
    if (names.has(s.name)) problems.push(`${s.name}: two screens with this name`)
    names.add(s.name)
    s.instances.forEach((i) => check(i, s.name))
  }
  return problems
}

/** The `setProperties` argument for an instance: property name → its `name#id` key on the instance. */
export function propertyValues(
  instanceKeys: string[],
  plan: InstancePlan,
): { values: Record<string, string | boolean>, missing: string[] } {
  const values: Record<string, string | boolean> = {}
  const missing: string[] = []
  for (const [name, value] of Object.entries(plan.properties ?? {})) {
    const key = instanceKeys.find((k) => k.replace(/#[^#]*$/, '') === name)
    if (key) values[key] = value
    else missing.push(name)
  }
  return { values, missing }
}
