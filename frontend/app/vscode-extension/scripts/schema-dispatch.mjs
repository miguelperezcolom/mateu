// The schema shape yaml-language-server (the Red Hat YAML extension VS Code validates with) can afford.
//
// The generated authoring schema (backend/shared/uidl/specs-schema.json, pinned by UidlSchemaTest)
// expresses every polymorphic family — `Component` above all, 125 branches — as a `oneOf` of `$ref`s,
// each branch an object whose `type` is a `const`. That is the natural JSON-Schema spelling and the
// one IntelliJ's JsonSchemaService completes well. yaml-language-server evaluates a `oneOf` by trying
// EVERY branch, at every nesting level, on every keystroke: the 2026-10 authoring walkthrough measured
// 5 s to validate a 4 KB page (demo-vb `components-2.yaml`), re-run while typing.
//
// The same family as a `type`-dispatch — `properties.type.enum` + one `if (type == X) then $ref X`
// per branch — validates that page in ~50 ms with the same completions in yaml-language-server
// (the enum lists the types, the matching `then` supplies the keys). IntelliJ, on the other hand,
// completes a nested `type:` from such a shape with a single value, so the shape is per EDITOR:
// the generated file stays the public contract, and only what this extension STAGES for its own
// `yamlValidation` contribution is rewritten (scripts/prepackage.mjs). One source, two spellings.

/** The `$defs` entries that are a `oneOf` of `$ref`s to objects with a `type` const. */
function dispatchableFamilies(schema) {
    const defs = schema.$defs ?? {}
    const out = []
    for (const [name, def] of Object.entries(defs)) {
        if (!Array.isArray(def.oneOf) || def.oneOf.length === 0) continue
        const branches = def.oneOf.map((b) => {
            const ref = typeof b?.$ref === 'string' && b.$ref.startsWith('#/$defs/') ? b.$ref.slice('#/$defs/'.length) : null
            const target = ref ? defs[ref] : null
            const konst = target?.properties?.type?.const
            return ref && konst === ref ? { ref, konst } : null
        })
        if (branches.every(Boolean)) out.push({ name, def, branches })
    }
    return out
}

/**
 * The editor variant: every polymorphic family rewritten as a `type` dispatch. The input is not
 * modified; everything else in the schema is kept byte-for-byte (same `$defs`, same descriptions).
 */
export function dispatchByType(schema) {
    const copy = JSON.parse(JSON.stringify(schema))
    for (const { name, def, branches } of dispatchableFamilies(copy)) {
        const { oneOf, ...rest } = def
        copy.$defs[name] = {
            ...rest,
            type: 'object',
            required: ['type'],
            properties: { type: { type: 'string', enum: branches.map((b) => b.konst) } },
            allOf: branches.map((b) => ({
                if: { properties: { type: { const: b.konst } }, required: ['type'] },
                then: { $ref: `#/$defs/${b.ref}` },
            })),
        }
    }
    return copy
}

/** The families the rewrite touches, for tests and logs. */
export function dispatchedFamilyNames(schema) {
    return dispatchableFamilies(schema).map((f) => f.name)
}
