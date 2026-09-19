import { parse } from 'yaml'

/**
 * AI-assisted scaffolds (visual-editor Phase 6) — the "have the AI build it" on-ramp, done the €0,
 * tool-agnostic way (the same shape as the mock-fixtures Import): the editor does NOT embed a paid LLM.
 * Instead it composes a COMPLETE prompt you paste into any AI (your IDE assistant, Claude, …), and
 * validates + loads the YAML the AI returns. No key, no backend, works offline against any assistant.
 */

export interface ScaffoldContext {
    /** The bound view model FQN, when the page has one. */
    modelView?: string
    /** Its contract field ids, so the AI binds to real members. */
    fields?: string[]
    /** Its contract action ids. */
    actions?: string[]
}

/**
 * Compose the prompt to hand an AI: the task, the rules that keep the output renderer-neutral and
 * valid (only real component types, the exact YAML shape, classless unless bound), the page context,
 * and the user's description. Deterministic + pure so it is unit-testable.
 */
export function buildScaffoldPrompt(description: string, knownTypes: string[], context?: ScaffoldContext): string {
    const types = [...knownTypes].sort()
    const lines: string[] = []
    lines.push('Generate a Mateu page layout as YAML. Output ONLY the YAML — no prose, no code fences.')
    lines.push('')
    lines.push('Rules:')
    lines.push('- The root is ONE component: a mapping with a `type:` and, for containers, a `content:` list of child components.')
    lines.push('- Use ONLY these component types: ' + types.join(', ') + '.')
    lines.push('- A form field is `{ type: FormField, id: <camelCaseId>, label: <Human Label> }`.')
    lines.push('- A button is `{ type: Button, label: <Label>, actionId: <camelCaseId> }`.')
    lines.push('- A stack is `{ type: VerticalLayout, content: [ ... ] }`; a row is `HorizontalLayout`.')
    if (context?.modelView) {
        lines.push(`- This page is bound to the data source \`${context.modelView}\`. Bind fields/buttons to its members ONLY.`)
        if (context.fields?.length) lines.push('  Available fields: ' + context.fields.join(', ') + '.')
        if (context.actions?.length) lines.push('  Available actions: ' + context.actions.join(', ') + '.')
        lines.push('- Do NOT emit a `modelView:` key (it is already bound).')
    } else {
        lines.push('- Classless page: do NOT emit a `modelView:` key.')
    }
    lines.push('')
    lines.push('Describe the screen to build:')
    lines.push(description.trim() || '(no description given)')
    return lines.join('\n')
}

export interface ScaffoldValidation {
    ok: boolean
    /** Component `type`s in the pasted YAML that are not in the known catalog. */
    unknownTypes: string[]
    /** A human message when the YAML can't be used at all (not parseable / no root type). */
    error?: string
}

/**
 * Validate the YAML an AI returned before loading it: it must parse, have a root `type`, and every
 * `type` in the tree must be a real component. Returns the unknown types so the user (or the AI) can
 * fix them — the editor never loads a tree the renderer can't paint.
 */
export function validateScaffoldYaml(yaml: string, knownTypes: string[]): ScaffoldValidation {
    let root: unknown
    try {
        root = parse(stripFences(yaml))
    } catch (e) {
        return { ok: false, unknownTypes: [], error: 'Not valid YAML: ' + (e as Error).message }
    }
    if (!root || typeof root !== 'object' || Array.isArray(root)) {
        return { ok: false, unknownTypes: [], error: 'The root must be a single component (a mapping with a `type:`).' }
    }
    if (typeof (root as Record<string, unknown>).type !== 'string') {
        return { ok: false, unknownTypes: [], error: 'The root component is missing a `type:`.' }
    }
    const known = new Set(knownTypes)
    const unknown = [...new Set(collectTypes(root).filter((t) => !known.has(t)))]
    return { ok: unknown.length === 0, unknownTypes: unknown }
}

/** Tolerate an AI that wraps the YAML in ```yaml … ``` fences despite the instruction. */
export function stripFences(text: string): string {
    const m = text.match(/^\s*```[a-zA-Z]*\n([\s\S]*?)\n```\s*$/)
    return m ? m[1] : text
}

function collectTypes(node: unknown): string[] {
    const out: string[] = []
    const visit = (n: unknown) => {
        if (!n || typeof n !== 'object') return
        if (Array.isArray(n)) { n.forEach(visit); return }
        const rec = n as Record<string, unknown>
        if (typeof rec.type === 'string') out.push(rec.type)
        for (const v of Object.values(rec)) visit(v)
    }
    visit(node)
    return out
}
