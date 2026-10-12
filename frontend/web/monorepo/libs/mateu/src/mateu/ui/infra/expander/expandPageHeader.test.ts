// A YAML page's header (overline, titlePlaceholder, timestamp, badges, kpis, peerNav,
// recordSwitcher, banners, fabs on a `type: Form`) and a YAML shell's header extras
// (contextSelectors, headerActions, notifications, globalSearch), expanded in the BROWSER the way the
// Java server maps them. Each golden was captured from the Java backend (YamlPageHeaderSyncTest /
// YamlAppShellHeaderSyncTest with -Dexpander.golden.write=true) from THE SAME YAML read here, so a
// specsOnly bundle shows what a served app shows.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'
import { expandAppShell } from '@infra/expander/expandDefinition'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import pageHeader from '@infra/expander/__fixtures__/page-header-extras.golden.json'
import switcherSource from '@infra/expander/__fixtures__/page-header-switcher-source.golden.json'
import shellExtras from '@infra/expander/__fixtures__/app-shell-extras.golden.json'

const TEST_RESOURCES = resolve(__dirname, '../../../../../../../../../../backend/shared/core/src/test/resources')
const authored = (path: string): FluentNode => parse(readFileSync(resolve(TEST_RESOURCES, path), 'utf-8'))
const goldenComponent = (golden: unknown) => (golden as any).fragments[0].component

describe('client-side expander — a YAML page header, against the Java golden', () => {
    it('every header key reaches the Form metadata with the server\'s shape', () => {
        const wire = expandComponent(authored('specs/ui/page-header-extras.yaml')) as any
        expectSubset(wire, goldenComponent(pageHeader))
        const m = wire.metadata
        expect(m).toMatchObject({ overline: 'Customers', titlePlaceholder: 'New customer…', timestamp: 'Last updated ${state.updatedAt}' })
        expect(m.badges.map((b: any) => [b.text, b.color])).toEqual([['${state.status}', 'success'], ['VIP', 'normal']])
        expect(m.kpis[0]).toEqual({ title: 'Balance', text: '${state.balance}' })
        expect(m.switcher).toMatchObject({ type: 'object', actionId: '_switchRecord', route: 'customers/${state._record}', searchable: true })
        expect(m.recordSwitcher).toBeUndefined()
        expect(m.banners[0]).toMatchObject({ theme: 'WARNING', hasCloseButton: true, hasIcon: false })
        expect(m.fabs.map((f: any) => f.actionId)).toEqual(['newOrder', 'email'])
        expect(m.fabs[1].buttonStyle).toBe('primary')
    })

    it('a switcher fed by a source keeps the reference and its own action', () => {
        const wire = expandComponent(authored('specs/ui/page-header-switcher-source.yaml')) as any
        expectSubset(wire, goldenComponent(switcherSource))
        expect(wire.metadata.switcher).toMatchObject({ type: 'context', actionId: 'pickCountry', optionsSource: { ref: 'countries' }, options: [] })
    })

    it('a Form that declares none of them emits nothing new', () => {
        const m = (expandComponent({ type: 'Form', title: 'Plain', content: [] }) as any).metadata
        for (const key of ['overline', 'badges', 'kpis', 'switcher', 'banners', 'fabs', 'peerNav']) {
            expect(m[key]).toBeUndefined()
        }
    })
})

describe('client-side expander — a YAML app shell\'s header extras, against the Java golden', () => {
    const shell = authored('mount-home/shell-extras/specs/ui/extras-shell.yaml')
    const app = (expandAppShell(shell).fragments![0].component as any).metadata
    const golden = goldenComponent(shellExtras).metadata

    it('pickers, header actions, the inbox and the search match the server', () => {
        for (const key of ['contextSelectors', 'contextActions', 'notificationsEnabled', 'notificationsSource',
            'notificationsReadSource', 'globalSearchEnabled', 'globalSearchSource']) {
            expectSubset(app[key], golden[key], key)
        }
        expect(app.contextSelectors[1]).toMatchObject({ fieldName: 'company', label: 'Company', optionsSource: { ref: 'companies' } })
        expect(app.contextActions[1].route).toBe('/reports')
        expect(app.contextActions[2].children[0].route).toBe('/help')
        expect(app.notificationsEnabled).toBe(true)
        expect(app.globalSearchSource).toMatchObject({ url: 'http://localhost:__PORT__/search?q=${state.searchText}', proxy: true })
    })

    it('a shell that declares none of them keeps them off', () => {
        const bare = (expandAppShell({ type: 'AppShell', title: 'x', menu: [] } as unknown as FluentNode)
            .fragments![0].component as any).metadata
        expect(bare).toMatchObject({ contextSelectors: [], contextActions: [], notificationsEnabled: false, globalSearchEnabled: false })
    })
})
