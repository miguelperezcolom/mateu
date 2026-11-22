import type { Rule } from '../FieldRenderer'

/**
 * A design system's OWN field controls, tried after the generic rules decided the field is an
 * editable value and before the generic select / text input draw it (a date picker, a step input,
 * a type-to-filter combo box…). The shared views have none: a renderer overrides this module
 * (src/overrides/render/fields/native.tsx) with rules that answer NOT_MINE (fields/rule.ts) for
 * anything they do not draw.
 */
export const NATIVE_RULES: Rule[] = []
