/**
 * The query of the browser URL as the ROUTE's parameters. A query key no Mateu screen reads but
 * the host's login flow adds — Spring Security's `?continue` after a form login — must not become a
 * route parameter (the first load went to `…/mateu/v3/sync/?continue`). Those artefacts are
 * dropped; every other key, and the order of the rest, is kept as written.
 */
export const LOGIN_FLOW_QUERY_KEYS: readonly string[] = ['continue']

export const routeQueryOf = (search: string | undefined | null): string => {
    if (!search || search === '?') return ''
    const raw = search.startsWith('?') ? search.substring(1) : search
    const kept = raw.split('&').filter(pair => {
        if (pair === '') return false
        const key = decodeKey(pair.split('=')[0])
        return !LOGIN_FLOW_QUERY_KEYS.includes(key)
    })
    return kept.length ? '?' + kept.join('&') : ''
}

const decodeKey = (key: string): string => {
    try {
        return decodeURIComponent(key.replace(/\+/g, ' '))
    } catch {
        return key
    }
}
