import rawSchema from 'virtual:uidl-schema'
import { ComponentSchema, ComponentSpec, parseSchema } from './componentSchema'

/**
 * The live catalog: {@link parseSchema} applied to the generated schema bundled by the vite plugin.
 * Kept apart from the pure {@link parseSchema} so unit tests can exercise the parser without the
 * virtual module (which only the bundler resolves).
 */
export const SCHEMA: ComponentSchema = parseSchema(rawSchema)

/** The spec for a node's component type, or undefined for an unknown/synthetic type. */
export function specFor(type: string | undefined): ComponentSpec | undefined {
    return type ? SCHEMA.components.get(type) : undefined
}

/** The values of a named schema enum (e.g. `AppVariant`), or an empty list if unknown. */
export function enumValues(name: string): string[] {
    return SCHEMA.enums.get(name) ?? []
}
