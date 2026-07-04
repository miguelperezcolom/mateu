import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/**
 * Extra named variables made available to an interpolated expression, besides
 * `state` and `data` (e.g. `{ appState, appData }`).
 */
export type InterpolationContext = Record<string, unknown>

/**
 * Evaluates `text` as a JS template literal with the given named variables in
 * scope. Throws on a failing expression — callers decide the error behaviour.
 * Uses `new Function` (not `eval`) so minifiers cannot rename the variables.
 */
const evalTemplate = (text: string, ctx: InterpolationContext): string =>
    new Function(...Object.keys(ctx), 'return `' + text + '`')(...Object.values(ctx))

const buildContext = (
    state?: ComponentState,
    data?: ComponentData,
    extra?: InterpolationContext
): InterpolationContext => ({ state: state ?? {}, data: data ?? {}, ...extra })

/**
 * Single source of truth for `${...}` label/title interpolation.
 *
 * Any string attribute that accepts a label or title (tab labels, section titles,
 * field labels, button labels, column headers, banner texts, KPI titles, …)
 * supports `${...}` template expressions evaluated against the current component
 * `state` and `data`. Pass `extra` to expose additional named variables to the
 * expression (e.g. `{ appState, appData }`).
 *
 * Texts without a `${` marker are returned unchanged (no evaluation cost).
 * A failing expression (syntax error, reference to an undeclared variable, …)
 * does NOT break rendering: the raw text is returned and a warning is logged.
 */
export function interpolate(text: string, state?: ComponentState, data?: ComponentData, extra?: InterpolationContext): string
export function interpolate(text: string | undefined, state?: ComponentState, data?: ComponentData, extra?: InterpolationContext): string | undefined
export function interpolate(
    text: string | undefined,
    state?: ComponentState,
    data?: ComponentData,
    extra?: InterpolationContext
): string | undefined {
    if (!text?.includes('${')) return text
    try {
        return evalTemplate(text, buildContext(state, data, extra))
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
    if (text && text.indexOf("${") >= 0) {
        try {
            return evalTemplate(text, buildContext(state, data))
        } catch (e) {
            return (e as Error).message
        }
    }
    return text;
}

/**
 * Two-pass interpolation used by text components and dialog header titles
 * (historical behaviour of `renderText`/`mateu-dialog`): the text is evaluated
 * once and, if the result still contains a `${` marker, evaluated a second
 * time. Expressions see `state`, `data`, `appState` and `appData`. On a
 * failing expression a descriptive error message is returned as the content
 * (so the problem is visible in the rendered page) and the error is logged.
 */
export const interpolateNested = (
    text: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData
): string | undefined => {
    if (!text) return text
    const ctx = buildContext(state, data, { appState: appState ?? {}, appData: appData ?? {} })
    let content = text
    try {
        content = evalTemplate(text, ctx)
        if (content.includes('${')) {
            try {
                content = evalTemplate(content, ctx)
            } catch (e) {
                content = 'when evaluating nested ' + text + ' :' + e + ', where data is ' + data
                    + ' and state is ' + state + ' and app state is ' + appState + ' and app data is ' + appData
                console.error(e, content, state, data, appState, appData)
            }
        }
    } catch (e) {
        content = 'when evaluating ' + text + ' :' + e + ', where data is ' + data
            + ' and state is ' + state + ' and app state is ' + appState + ' and app data is ' + appData
        console.error(e, content, state, data, appState, appData)
    }
    return content
}

/**
 * Interpolates `text` as a template literal and then evaluates the resulting
 * string as a JS expression (historical `eval(eval(...))` of e.g. the confirm
 * dialog's `openedCondition`). Expressions see `state`, `data`, `appState` and
 * `appData`. Throws on failure — callers decide the error behaviour.
 */
export const interpolateAndEvaluate = (
    text: string,
    state: ComponentState,
    data: ComponentData,
    appState?: ComponentState,
    appData?: ComponentData
): unknown => {
    const ctx = buildContext(state, data, { appState: appState ?? {}, appData: appData ?? {} })
    const interpolated = evalTemplate(text, ctx)
    return new Function(...Object.keys(ctx), `return (${interpolated})`)(...Object.values(ctx))
}
