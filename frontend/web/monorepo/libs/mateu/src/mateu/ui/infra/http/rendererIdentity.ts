/**
 * Who is calling: the `X-Mateu-Renderer` request header every Mateu sync/sse call carries,
 * `<name>/<version> wire/<major>.<minor>` (e.g. `vaadin/0.0.15 wire/3.0`). The server only logs a
 * mismatching wire major — it never refuses — so a renderer older than the server is visible in
 * its logs instead of only as a half-broken screen.
 *
 * Only Mateu endpoints get it: a third-party REST source (restAction / rowsSource / options) is
 * none of its business.
 */
import { SUPPORTED_WIRE_VERSION } from '@infra/http/wireVersion.ts'

export const RENDERER_HEADER = 'X-Mateu-Renderer'

let name = 'vaadin'
let version = 'unknown'

/** Header-safe token: printable ASCII without spaces or slashes, else `unknown`. */
const token = (value: string | undefined): string => {
    const cleaned = (value ?? '').trim().replace(/[^A-Za-z0-9._+-]/g, '')
    return cleaned === '' ? 'unknown' : cleaned.slice(0, 64)
}

/** Set by the renderer's composition root (its package version, injected at build time). */
export function setRendererIdentity(identity: { name?: string, version?: string }): void {
    if (identity.name !== undefined) name = token(identity.name)
    if (identity.version !== undefined) version = token(identity.version)
}

/** The header value, e.g. `vaadin/0.0.15 wire/3.0`. */
export function rendererHeaderValue(): string {
    return `${name}/${version} wire/${SUPPORTED_WIRE_VERSION}`
}

/** The header as a map, to spread into a request's headers. */
export function rendererHeaders(): Record<string, string> {
    return { [RENDERER_HEADER]: rendererHeaderValue() }
}
