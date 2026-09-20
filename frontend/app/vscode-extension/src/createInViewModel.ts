// "Create field '<id>' in <ViewModel>" for VSCode — the code-action twin of the IntelliJ
// CreateFieldInViewModelFix (visual-editor Phase 5, §G). When a `specs/ui/*.yaml` page binds a
// `FormField` whose `id:` the bound ModelView does not declare, offer to write the field into the
// Java class instead of only flagging the dangling binding.
//
// This file is the PURE core (no `vscode` import) so it is unit-testable: YAML binding extraction,
// the dataType→Java-type map, the class/record checks and the insertion computation. The thin
// CreateInViewModelProvider wires it to the workspace (resolve the file, apply a WorkspaceEdit).

import { parse } from 'yaml'

/** A `FormField` binding found in a page: the id and its declared wire dataType (when present). */
export interface FieldBinding {
    id: string
    dataType?: string
}

/** What a page declares that this feature reads: the bound ModelView FQN + its FormField bindings. */
export interface PageBindings {
    modelView?: string
    fields: FieldBinding[]
}

/** The Java type for a Mateu wire dataType — mirrors CreateFieldInViewModelFix.javaType (Kotlin).
 *  Unknown/absent → String (the safe, common default). */
export function javaTypeForDataType(dataType?: string): string {
    switch (dataType) {
        case 'integer': return 'Integer'
        case 'number': case 'decimal': return 'Double'
        case 'bool': case 'boolean': return 'Boolean'
        case 'date': return 'java.time.LocalDate'
        case 'dateTime': return 'java.time.LocalDateTime'
        case 'time': return 'java.time.LocalTime'
        case 'money': return 'java.math.BigDecimal'
        default: return 'String'
    }
}

/** A valid Java identifier (so we never write an uncompilable field). Mirrors the Kotlin check. */
export function isValidJavaIdentifier(s: string): boolean {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s)
}

/**
 * Read a page's `modelView` and every `FormField` binding (id + dataType) from its YAML — envelope
 * form (`modelView:` + `layout:`) or a bare component tree. Walks the whole layout so fields nested
 * in sections/tabs/slots are found. A field with no `id:` is skipped (nothing to bind).
 */
export function extractBindings(yaml: string): PageBindings {
    let root: unknown
    try { root = parse(yaml) } catch { return { fields: [] } }
    if (!root || typeof root !== 'object') return { fields: [] }
    const obj = root as Record<string, unknown>
    const modelView = typeof obj.modelView === 'string' ? obj.modelView : undefined
    const layout = obj.layout ?? obj
    const fields: FieldBinding[] = []
    const seen = new Set<string>()
    const walk = (node: unknown): void => {
        if (!node || typeof node !== 'object') return
        if (Array.isArray(node)) { node.forEach(walk); return }
        const n = node as Record<string, unknown>
        if (n.type === 'FormField' && typeof n.id === 'string' && n.id && !seen.has(n.id)) {
            seen.add(n.id)
            fields.push({ id: n.id, dataType: typeof n.dataType === 'string' ? n.dataType : undefined })
        }
        // A Slotted's content is a single node; every other container's is an array — walk both.
        walk(n.content)
        walk(n.children)
    }
    walk(layout)
    return { modelView, fields }
}

/** The simple name of an FQN (last segment; a nested `Outer$Inner` resolves to `Inner`). */
export function simpleName(fqn: string): string {
    return fqn.substring(Math.max(fqn.lastIndexOf('.'), fqn.lastIndexOf('$')) + 1)
}

/**
 * Whether a Java source file declares the class named by `fqn` — its `package` matches the FQN's
 * package (or the FQN is unqualified) AND it declares a `class`/`record`/`interface`/`enum` of the
 * simple name. A cheap structural check (no parser) good enough to pick the right file among the
 * candidates the workspace search returns for a simple name.
 */
export function declaresClass(javaSource: string, fqn: string): boolean {
    const name = simpleName(fqn)
    const dot = fqn.lastIndexOf('.')
    const pkg = dot >= 0 ? fqn.substring(0, dot) : ''
    if (pkg) {
        const m = javaSource.match(/^\s*package\s+([\w.]+)\s*;/m)
        if (!m || m[1] !== pkg) return false
    }
    return new RegExp(`\\b(class|record|interface|enum)\\s+${name}\\b`).test(javaSource)
}

/** Whether the class of `simpleName` is a `record` (no addable instance field — like the Kotlin fix). */
export function isRecord(javaSource: string, name: string): boolean {
    return new RegExp(`\\brecord\\s+${name}\\b`).test(javaSource)
}

/** Whether the class already declares a member named `id` (a field, or a record component). */
export function hasField(javaSource: string, id: string): boolean {
    // a plain field: `<modifiers> <Type> <id>;` / `<Type> <id> =`  — or a record component `(… <id> …)`.
    if (new RegExp(`\\b${id}\\s*[;=,)]`).test(javaSource)) return true
    return false
}

/** The insertion for a new `private <type> <id>;` field, or null when it can't/needn't be added.
 *  Inserts right after the target class's opening brace (matched by the class declaration), so the
 *  field lands at the top of the body. Records are refused (no addable instance field). */
export function computeFieldInsertion(
    javaSource: string, fqn: string, id: string, javaType: string,
): { index: number; text: string } | null {
    if (!isValidJavaIdentifier(id)) return null
    const name = simpleName(fqn)
    if (isRecord(javaSource, name)) return null
    if (hasField(javaSource, id)) return null
    const decl = new RegExp(`\\b(class|interface|enum)\\s+${name}\\b`).exec(javaSource)
    if (!decl) return null
    const brace = javaSource.indexOf('{', decl.index)
    if (brace < 0) return null
    return { index: brace + 1, text: `\n    private ${javaType} ${id};\n` }
}
