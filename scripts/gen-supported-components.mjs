#!/usr/bin/env node
// Writes the component catalogue into doc/src/content/docs/java-ui-definition/supported-components.md,
// between the GENERATED markers, from backend/shared/uidl/uidl-catalog.json — the generated catalogue
// (UidlSchemaGenerator.generateCatalog, pinned by UidlSchemaTest) that already carries every component
// type a definition can use and its description (the record's Javadoc first sentence). A hand-kept
// list fell ~100 types behind; this one cannot.
//
//   node scripts/gen-supported-components.mjs           # rewrite the page
//   node scripts/gen-supported-components.mjs --check   # exit 1 when the page is stale (CI)
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(root, 'backend/shared/uidl/uidl-catalog.json')
const pagePath = join(root, 'doc/src/content/docs/java-ui-definition/supported-components.md')
const docs = join(root, 'doc/src/content/docs')
const BEGIN = '<!-- GENERATED from backend/shared/uidl/uidl-catalog.json by scripts/gen-supported-components.mjs — do not edit -->'
const END = '<!-- END GENERATED -->'

// The page a type is explained on, when its name does not say it.
const PAGE_OF = {
  ItemOverviewPage: 'ux-patterns/item-overview',
  WelcomePage: 'ux-patterns/welcome-page',
  MultimediaContentPage: 'ux-patterns/multimedia-content',
  CollectionDetailPage: 'ux-patterns/collection-detail',
  DataManagementPage: 'ux-patterns/data-management',
  FoldoutPage: 'ux-patterns/foldout',
  FoldoutLayout: 'ux-patterns/foldout',
  FoldoutPanel: 'ux-patterns/foldout',
  GeneralOverviewPage: 'ux-patterns/general-overview',
  GuidedProcessPage: 'define/yaml/pages',
  GuidedProcessStep: 'define/yaml/pages',
  HeroSearchPage: 'ux-patterns/hero-search',
  HeroSection: 'ux-patterns/hero-search',
  DashboardLandingPage: 'ux-patterns/dashboard',
  DashboardLayout: 'ux-patterns/dashboard',
  DashboardPanel: 'ux-patterns/dashboard',
  MetricCard: 'ux-patterns/dashboard',
  Scoreboard: 'ux-patterns/dashboard',
  AdvancedCreateEditPage: 'ux-patterns/advanced-create-and-edit',
  DockedPanel: 'ux-patterns/data-management',
  EmptyState: 'ux-patterns/empty-states-and-skeletons',
  Skeleton: 'ux-patterns/empty-states-and-skeletons',
  DropZone: 'ux-patterns/drag-to-a-destination',
  Gantt: 'ux-patterns/gantt',
  Partial: 'define/yaml/partials',
  ComponentRef: 'define/yaml/partials',
  Listing: 'define/yaml/pages',
  MenuSeparator: 'java-user-manual/build/navigation-and-menus',
  MethodLink: 'java-user-manual/build/navigation-and-menus',
  RouteLink: 'java-user-manual/build/navigation-and-menus',
  RemoteMenu: 'java-user-manual/build/navigation-and-menus',
  RuleLink: 'java-user-manual/build/navigation-and-menus',
  Menu: 'java-user-manual/build/navigation-and-menus',
  FieldLink: 'java-user-manual/build/navigation-and-menus',
  ContentLink: 'java-user-manual/build/navigation-and-menus',
  MenuBar: 'java-user-manual/build/navigation-and-menus',
  AppShell: 'define/yaml/app-shell',
  AccordionPanel: 'java-ui-definition/components/accordion-layout',
  AddOnPicker: 'ux-patterns/addon-picker',
  AvatarGroup: 'java-ui-definition/components/avatar',
  BoardLayoutItem: 'java-ui-definition/components/board-layout',
  BoardLayoutRow: 'java-ui-definition/components/board-layout',
  GridColumn: 'java-ui-definition/components/grid',
  GridGroupColumn: 'java-ui-definition/components/grid',
  Tab: 'java-ui-definition/components/tab-layout',
  FormItem: 'java-ui-definition/components/form-layout',
  FormRow: 'java-ui-definition/components/form-layout',
  FormSection: 'java-ui-definition/components/form-layout',
  FormSubSection: 'java-ui-definition/components/form-layout',
}
const STEPS_PAGE = 'concepts/action-catalogue'
const TRIGGERS_PAGE = 'concepts/state-and-triggers'

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
const pageExists = (slug) => existsSync(join(docs, slug + '.md')) || existsSync(join(docs, slug + '.mdx'))

/** The doc page a type links to, or null. */
export function pageOf(type, family) {
  if (PAGE_OF[type] && pageExists(PAGE_OF[type])) return PAGE_OF[type]
  if (family === 'Step') return STEPS_PAGE
  if (family === 'Trigger') return TRIGGERS_PAGE
  const names = [type, type.replace(/(Layout|Page)$/, '')].map(kebab)
  for (const name of names) {
    for (const dir of ['java-ui-definition/components', 'ux-patterns']) {
      if (pageExists(`${dir}/${name}`)) return `${dir}/${name}`
    }
  }
  return null
}

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()

function row(c, family) {
  const page = pageOf(c.type, family)
  const name = page ? `[\`${c.type}\`](/${page}/)` : `\`${c.type}\``
  const attrs = (c.attributes || []).map((a) => `\`${a.name}\``).join(', ')
  return `| ${name} | ${cell(c.description)} | ${attrs} |`
}

export function render(catalog) {
  const families = catalog.families || {}
  const familyOf = {}
  for (const [family, types] of Object.entries(families)) for (const t of types) familyOf[t] = family
  const byType = Object.fromEntries((catalog.components || []).map((c) => [c.type, c]))
  const all = Object.keys(byType).sort()
  const components = all.filter((t) => !familyOf[t])
  const head = '| Type | What it is | Main attributes |\n|---|---|---|'
  const out = [BEGIN, '']
  out.push(`${all.length} types (catalogue version ${catalog.version}). The common attributes every component takes — \`style\`, \`cssClasses\`, \`note\` and the access keys — are left out.`, '')
  out.push('### Components', '', head, ...components.map((t) => row(byType[t], null)), '')
  const titles = {
    FormTemplate: ['Page templates', 'The value of a `Form`\'s `template:` — see [page templates](/define/yaml/pages/#page-templates--template).'],
    Actionable: ['Menu entries', 'What an app shell menu (and a `MenuBar`) is made of.'],
    UserTrigger: ['Toolbar and button entries', 'What a `toolbar:` or `buttons:` list holds.'],
    Trigger: ['Triggers', 'What a definition\'s `triggers:` list holds.'],
    Step: ['Flow steps', 'The steps of an action\'s client-side flow (`steps:`).'],
  }
  for (const family of Object.keys(families).sort()) {
    const [title, intro] = titles[family] || [family, '']
    const types = families[family].filter((t) => byType[t]).sort()
    if (!types.length) continue
    out.push(`### ${title}`, '', intro, '', head, ...types.map((t) => row(byType[t], family)), '')
  }
  out.push(END)
  return out.join('\n')
}

export function updatedPage(page, catalog) {
  const start = page.indexOf(BEGIN)
  const end = page.indexOf(END)
  if (start < 0 || end < 0) throw new Error('supported-components.md has no GENERATED markers')
  return page.slice(0, start) + render(catalog) + page.slice(end + END.length)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
  const page = readFileSync(pagePath, 'utf8')
  const next = updatedPage(page, catalog)
  if (process.argv.includes('--check')) {
    if (next !== page) {
      console.error('supported-components.md is stale: run node scripts/gen-supported-components.mjs')
      process.exit(1)
    }
    console.log('supported-components.md matches uidl-catalog.json')
  } else {
    writeFileSync(pagePath, next)
    console.log('wrote', pagePath)
  }
}
