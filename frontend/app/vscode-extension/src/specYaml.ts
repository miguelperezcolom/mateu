import { parse } from 'yaml'

/**
 * The reader of spec YAML (`specs/ui/**`) as DATA in the visual editor and the VS Code extension —
 * the twin of the backend's `SpecsYaml`, so a file means the same thing there (canvas, Play,
 * indexes, wizards) as on the server. TWO IDENTICAL COPIES: apps/visual-editor/src/model/specYaml.ts
 * and frontend/app/vscode-extension/src/specYaml.ts (the extension compiles only its own src/);
 * the extension's specYaml.test.ts fails when they differ — edit both.
 *
 * - **Merge keys are applied** (`<<: *base`, `<<: [*a, *b]`), with YAML 1.1's rules, which are
 *   SnakeYAML's: a key the mapping writes itself wins over a merged one, and among several bases the
 *   EARLIER one wins. The `yaml` library keeps `<<` as an ordinary property unless asked.
 * - **A recursive alias is refused** (`&loop {content: [*loop]}`): the `yaml` library hands it over
 *   as a CYCLIC object, which every walk of a definition then follows until the stack overflows. The
 *   backend refuses it ("the file does not load"), so here it throws {@link YamlAliasCycleError}
 *   and the file reads as invalid YAML, through the same `catch` every reader already has.
 *
 * An alias shared by two siblings (the same object reached twice, no cycle) is ordinary YAML and
 * reads as before. The AST editors (`yamlEdit`, `yamlPreserve`) work on the document's nodes, not on
 * this data; `yamlPreserve` reads its result back with `parseSpec` (and refuses an original it
 * cannot read), and the editor unshares alias uses itself (`pageModel.unshared`).
 */
export class YamlAliasCycleError extends Error {
    constructor() {
        super('A YAML alias refers to itself (a recursive alias): the file does not load')
        this.name = 'YamlAliasCycleError'
    }
}

/** `text` parsed as spec YAML: merge keys applied, a recursive alias refused (throws). */
export function parseSpec(text: string): any {
    const value = parse(text, { merge: true })
    assertAcyclic(value)
    return value
}

/** Throws {@link YamlAliasCycleError} when `value` reaches itself (an object on its own path). */
export function assertAcyclic(value: unknown): void {
    if (hasCycle(value)) throw new YamlAliasCycleError()
}

/**
 * Whether `value` contains an object reachable from itself. Only objects on the CURRENT path count —
 * an object met again on another branch (a shared alias) is no cycle — and an object already fully
 * walked is not walked again, so a file that shares an anchor many times stays linear.
 */
export function hasCycle(value: unknown): boolean {
    const onPath = new Set<object>()
    const done = new Set<object>()
    const visit = (v: unknown): boolean => {
        if (!v || typeof v !== 'object') return false
        if (onPath.has(v)) return true
        if (done.has(v)) return false
        onPath.add(v)
        const children = v instanceof Map ? [...v.keys(), ...v.values()] : v instanceof Set ? [...v] : Object.values(v)
        for (const c of children) if (visit(c)) return true
        onPath.delete(v)
        done.add(v)
        return false
    }
    return visit(value)
}
