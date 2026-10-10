// Every "New › Mateu › Page…" skeleton the IDE plugins ship must expand in the browser to a wire the
// renderer can draw. The failure mode this guards: an authored component node (`{type: …}`) left
// RAW inside some component's `metadata` — the Java mappers map every component-valued key (lift it
// to children, or expand it in place), so the renderer only ever looks for WIRE components there,
// and a raw node renders as nothing (Scoreboard.metrics, TabLayout.tabs, FoldoutLayout.overview/
// panels, Card.title and Form.header all did, before they were mapped).
//
// The skeletons are read from the IntelliJ plugin's bundled set (the VS Code extension ships the same
// files), with the placeholders filled the way MateuNewFiles.render fills them.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { expandDefinition, type DefinitionSpec } from '@infra/expander/expandDefinition'

const TEMPLATES = resolve(__dirname, '../../../../../../../../../app/intellij-plugin/src/main/resources/fileTemplates/internal')

/** Fill a skeleton as the plugins do: a title, and the `__PAGE_WIDTH__` line → a `style:` line. */
export function renderTemplate(text: string, title = 'Sample page'): string {
    return text.split('\n')
        .map((line) => line.trim() === '__PAGE_WIDTH__'
            ? line.replace('__PAGE_WIDTH__', 'style: "max-width: min(1408px, 100% - 48px); margin-inline: auto;"')
            : line)
        .join('\n')
        .replace(/__TITLE__/g, title)
        .replace(/__NAME__/g, 'sample')
}

export const pageTemplates = (): { name: string, spec: DefinitionSpec }[] =>
    readdirSync(TEMPLATES)
        .filter((f) => f.endsWith('.yaml.ft') && (f.startsWith('Mateu Page ') || f === 'Mateu App Shell.yaml.ft'))
        .sort()
        .map((f) => ({ name: f.replace(/\.yaml\.ft$/, ''), spec: parse(renderTemplate(readFileSync(resolve(TEMPLATES, f), 'utf-8'))) }))

// Metadata keys whose authored nodes are NOT wire components ON PURPOSE — each is serialised as its
// own wire type by the Java mapper, and the expander maps it accordingly (expandButton/expandColumn/
// expandFilter):
//  - toolbar/buttons: FormMapper.mapToButtonDto / CrudlMapper — a ButtonDto, not ClientSide-wrapped;
//  - columns: CrudlMapper → GridColumnMapper (ClientSide-wrapped, walked below like any child);
//  - filters: CrudlMapper → FieldMapper — a FormFieldDto, not ClientSide-wrapped.
const DATA_KEYS = new Set(['toolbar', 'buttons', 'filters'])

const isWire = (v: unknown): v is { type: string, metadata?: Record<string, unknown>, children?: unknown[] } =>
    !!v && typeof v === 'object' && ['ClientSide', 'ServerSide'].includes((v as { type?: unknown }).type as string)

/** Every path inside a wire tree where an authored component node is left in metadata. */
export function rawNodesIn(wire: unknown, path = ''): string[] {
    const found: string[] = []
    const visitValue = (v: unknown, p: string) => {
        if (Array.isArray(v)) v.forEach((x, i) => visitValue(x, `${p}[${i}]`))
        else if (isWire(v)) found.push(...rawNodesIn(v, p))
        else if (v && typeof v === 'object') {
            if (typeof (v as { type?: unknown }).type === 'string') found.push(`${p} (${(v as { type: string }).type})`)
            for (const [k, x] of Object.entries(v)) visitValue(x, `${p}.${k}`)
        }
    }
    if (!isWire(wire)) return found
    const meta = wire.metadata ?? {}
    for (const [k, v] of Object.entries(meta)) {
        if (k === 'type' || DATA_KEYS.has(k)) continue
        visitValue(v, `${path}.metadata.${k}`)
    }
    for (const k of ['children'] as const) {
        ;((wire as Record<string, unknown>)[k] as unknown[] | undefined ?? []).forEach((c, i) => {
            found.push(...rawNodesIn(c, `${path}.children[${i}]`))
        })
    }
    return found
}

describe('client-side expander — every IDE page template expands to a drawable wire', () => {
    const templates = pageTemplates()

    it('finds the bundled templates', () => {
        expect(templates.length).toBeGreaterThanOrEqual(18)
    })

    for (const { name, spec } of templates) {
        it(`${name}: no authored component node is left in metadata`, () => {
            const increment = expandDefinition(spec, 'sample')
            const component = increment.fragments![0].component
            expect(rawNodesIn(component)).toEqual([])
        })
    }
})
