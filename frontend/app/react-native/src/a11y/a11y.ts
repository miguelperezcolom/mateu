/**
 * Accessibility helpers for the React Native renderer.
 *
 * Mobile screen readers (VoiceOver, TalkBack) read the accessibility tree, and React Native builds
 * that tree from explicit props — there is no DOM to infer it from. Two consequences that make
 * this different from the web renderers:
 *
 *  - A `TextInput` has NO way to be associated with a nearby `<Text>` label. There is no
 *    `labelFor`, no `aria-labelledby`. If `accessibilityLabel` is not passed, the field is
 *    announced as "text field", with no indication of what it is for — the label sitting right
 *    above it is read as separate, unrelated text.
 *  - A `TouchableOpacity` IS accessible by default and collects its child text, so a button
 *    labelled "Save" announces "Save". But it is not announced AS a button without a role, and an
 *    icon-only one announces the glyph — "✕", "⋯" — which tells the user nothing.
 *
 * Everything here returns plain prop objects to spread, so a call site stays one line and the
 * decision about what a control IS stays next to the control.
 */
import { AccessibilityInfo, Platform } from 'react-native'

/** What a control is, in the vocabulary the platform screen readers understand. */
export type A11yRole = 'button' | 'link' | 'checkbox' | 'radio' | 'switch' | 'tab' | 'menuitem'
    | 'header' | 'image' | 'search' | 'summary' | 'adjustable' | 'none'

/**
 * Speaks `message` immediately. Used where the web renderers use a live region: a failed save, a
 * completed navigation — anything the user must learn about without going looking for it.
 *
 * Deliberately not throttled: the call sites are events the user caused, not a polling loop.
 */
export const announce = (message: string): void => {
    const text = (message ?? '').trim()
    if (!text) return
    AccessibilityInfo.announceForAccessibility(text)
}

/** Whether a screen reader is running, for the rare case where behaviour should differ. */
export const isScreenReaderEnabled = (): Promise<boolean> =>
    AccessibilityInfo.isScreenReaderEnabled()

export interface ButtonA11yOptions {
    /** Overrides the label collected from child text — required for an icon-only control. */
    label?: string
    role?: A11yRole
    disabled?: boolean
    selected?: boolean
    expanded?: boolean
    /** What happens on activation, when the label alone does not make it obvious. */
    hint?: string
}

/**
 * Props for anything tappable.
 *
 * `accessibilityRole` is the part that is always worth passing: without it the control is read as
 * plain text and the user is never told they can act on it.
 */
export const buttonA11y = (options: ButtonA11yOptions = {}) => {
    const state: Record<string, boolean> = {}
    if (options.disabled !== undefined) state.disabled = options.disabled
    if (options.selected !== undefined) state.selected = options.selected
    if (options.expanded !== undefined) state.expanded = options.expanded
    return {
        accessible: true,
        accessibilityRole: (options.role ?? 'button') as A11yRole,
        ...(options.label ? { accessibilityLabel: options.label } : {}),
        ...(options.hint ? { accessibilityHint: options.hint } : {}),
        ...(Object.keys(state).length ? { accessibilityState: state } : {}),
    }
}

export interface FieldA11yOptions {
    label?: string
    /** @Help / description — read after the name, as guidance rather than as part of it. */
    description?: string
    required?: boolean
    editable?: boolean
    /** Server-side validation message currently on the field. */
    error?: string
}

/**
 * Props for an input.
 *
 * The error is folded into the LABEL rather than the hint on purpose: hints are announced last and
 * can be turned off entirely in the OS settings, so a message the user must hear cannot live
 * there. "Email, required, invalid: must contain @" is read as one coherent name.
 */
export const fieldA11y = (options: FieldA11yOptions = {}) => {
    const parts: string[] = []
    if (options.label) parts.push(options.label)
    if (options.required) parts.push('required')
    if (options.error) parts.push(`invalid: ${options.error}`)
    const state: Record<string, boolean> = {}
    if (options.editable === false) state.disabled = true
    return {
        accessible: true,
        ...(parts.length ? { accessibilityLabel: parts.join(', ') } : {}),
        ...(options.description ? { accessibilityHint: options.description } : {}),
        ...(Object.keys(state).length ? { accessibilityState: state } : {}),
    }
}

/**
 * Props for the container of an overlay, so the screen reader stops at its edge.
 *
 * iOS honours `accessibilityViewIsModal`; Android needs the content BEHIND the overlay to be
 * excluded instead, which the modal's own container cannot express — so the two platforms get
 * the prop each one understands, and passing both is harmless.
 */
export const modalA11y = (label?: string) => ({
    ...(Platform.OS === 'ios' ? { accessibilityViewIsModal: true } : {}),
    accessibilityRole: 'none' as A11yRole,
    ...(label ? { accessibilityLabel: label } : {}),
    // Android: everything outside an important-for-accessibility container is skipped.
    importantForAccessibility: 'yes' as const,
})

/** Marks text as a heading, so the user can jump between sections with the rotor/reading control. */
export const headingA11y = (level?: number) => ({
    accessibilityRole: 'header' as A11yRole,
    ...(level ? { 'aria-level': level } : {}),
})
