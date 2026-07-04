import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/**
 * Single source of truth for `${...}` label/title interpolation.
 *
 * Any string attribute that accepts a label or title (tab labels, section titles,
 * field labels, button labels, column headers, banner texts, KPI titles, …)
 * supports `${...}` template expressions evaluated against the current component
 * `state` and `data`.
 *
 * Texts without a `${` marker are returned unchanged (no evaluation cost).
 * A failing expression (syntax error, reference to an undeclared variable, …)
 * does NOT break rendering: the raw text is returned and a warning is logged.
 */
export function interpolate(text: string, state?: ComponentState, data?: ComponentData): string
export function interpolate(text: string | undefined, state?: ComponentState, data?: ComponentData): string | undefined
export function interpolate(
    text: string | undefined,
    state?: ComponentState,
    data?: ComponentData
): string | undefined {
    if (!text?.includes('${')) return text
    try {
        return new Function('state', 'data', 'return `' + text + '`')(state ?? {}, data ?? {})
    } catch (e) {
        console.warn(`Mateu: could not interpolate "${text}":`, e)
        return text
    }
}

/**
 * Like {@link interpolate} but keeps the historical error behaviour of page
 * titles/subtitles/KPI texts: on a failing expression the error message is
 * returned (so the problem is visible in the rendered page).
 */
export const possiblyHtml = (
    text: string | undefined,
    state: ComponentState,
    data: ComponentData
): string | undefined => {
    void state; void data;  // captured by eval template literal
    if (text && text.indexOf("${") >= 0) {
        try {
            return eval('`' + text + '`')
        } catch (e) {
            return (e as Error).message
        }
    }
    return text;
}
