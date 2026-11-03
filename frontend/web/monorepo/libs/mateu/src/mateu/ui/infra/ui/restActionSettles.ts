/**
 * Does a successful REST action leave nothing unsaved? It does when it validated the form first (a
 * save) or moves on (`successRoute`). An upload beside a half-edited form does neither.
 */
export const restActionSettlesTheForm = (rest: { successRoute?: string }, action?: { validationRequired?: boolean }): boolean =>
    !!rest.successRoute || !!action?.validationRequired
