/**
 * Share links — a design travels inside a URL (the idea comes from lnkiai/m3e-canvas, MIT).
 *
 * The YAML (plus, optionally, the rest of the mount) is JSON-encoded, raw-deflated and base64url'd
 * after `#mateuz=`, or plain URI-encoded JSON after `#mateu=` for tools that cannot compress. It goes
 * in the FRAGMENT, which a browser never sends to the server — nothing is stored anywhere, and a
 * statically hosted editor stays static.
 *
 * Two producers: the editor itself ("Share link"), and an AI agent following `public/agent.md`,
 * which writes the YAML and answers with such a link instead of asking the user to paste YAML. The
 * inverse of the AI-scaffold prompt, and just as €0 and tool-agnostic. Pure + unit-tested.
 */

export const SHARE_PARAM = 'mateuz'
export const SHARE_PLAIN_PARAM = 'mateu'

/** What a link carries. `yaml` is the file to open; `files` (path → yaml) the rest of the mount, if any. */
export interface SharedDesign {
    v: 1
    /** The opened file's path relative to `specs/ui/` (e.g. `orders.yaml`), when known. */
    path?: string
    yaml: string
    files?: Record<string, string>
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Whether a parsed value has the shape of a shared design. Older/newer `v`s are refused, not guessed. */
export function isSharedDesign(v: unknown): v is SharedDesign {
    if (!isRecord(v) || v.v !== 1 || typeof v.yaml !== 'string') return false
    if (v.path !== undefined && typeof v.path !== 'string') return false
    if (v.files !== undefined && !(isRecord(v.files) && Object.values(v.files).every((c) => typeof c === 'string'))) return false
    return true
}

/** The link for a design, on the editor living at `base` (any URL; its own fragment is dropped). */
export async function encodeShareLink(design: SharedDesign, base: string): Promise<string> {
    const json = JSON.stringify(design)
    const packed = await pipe(new TextEncoder().encode(json), new CompressionStream('deflate-raw'))
    return `${base.split('#')[0]}#${SHARE_PARAM}=${toBase64Url(packed)}`
}

/** The uncompressed spelling (`#mateu=`), for a producer that has no deflate at hand. */
export function encodePlainShareLink(design: SharedDesign, base: string): string {
    return `${base.split('#')[0]}#${SHARE_PLAIN_PARAM}=${encodeURIComponent(JSON.stringify(design))}`
}

/**
 * Read a design back from whatever the user pasted: a whole link, just its fragment, or the bare JSON
 * document. Null when it is none of those — never throws, since the input is anything a person pastes.
 */
export async function decodeShared(input: string): Promise<SharedDesign | null> {
    const text = input.trim()
    if (!text) return null
    if (text.startsWith('{')) return parseDesign(text)
    const hash = text.includes('#') ? text.slice(text.indexOf('#') + 1) : text
    const params = new URLSearchParams(hash)
    const packed = params.get(SHARE_PARAM)
    if (packed) {
        try {
            const bytes = await pipe(fromBase64Url(packed), new DecompressionStream('deflate-raw'))
            return parseDesign(new TextDecoder().decode(bytes))
        } catch {
            return null
        }
    }
    // URLSearchParams already percent-decodes the value.
    const plain = params.get(SHARE_PLAIN_PARAM)
    return plain ? parseDesign(plain) : null
}

/** Whether a location hash carries a design (cheap check before the async decode). */
export function hasSharedDesign(hash: string): boolean {
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    return params.has(SHARE_PARAM) || params.has(SHARE_PLAIN_PARAM)
}

function parseDesign(json: string): SharedDesign | null {
    try {
        const v: unknown = JSON.parse(json)
        return isSharedDesign(v) ? v : null
    } catch {
        return null
    }
}

const toBase64Url = (bytes: Uint8Array) => {
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromBase64Url = (s: string) => {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
    const bin = atob(b64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
}

async function pipe(bytes: Uint8Array, stream: { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> }): Promise<Uint8Array> {
    const writer = stream.writable.getWriter()
    // The writer's own promises reject on bad input too; the read below is what reports the failure.
    writer.write(bytes as Uint8Array<ArrayBuffer>).catch(() => {})
    writer.close().catch(() => {})
    const chunks: Uint8Array[] = []
    const reader = stream.readable.getReader()
    for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
    }
    const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0))
    let at = 0
    for (const c of chunks) { out.set(c, at); at += c.length }
    return out
}

/** Where the published agent guide lives (raw, on master — like the published JSON schemas). */
export const AGENT_GUIDE_URL =
    'https://raw.githubusercontent.com/miguelperezcolom/mateu/master/frontend/web/monorepo/apps/visual-editor/public/agent.md'

/**
 * The instruction a user hands a coding agent (Claude Code, Codex, …): read the guide, build what I
 * describe, answer with a link to MY editor. The editor's own address goes in, so the link opens here.
 */
export function buildAgentInstruction(description: string, editorBase: string, currentPath?: string): string {
    return [
        `Read ${AGENT_GUIDE_URL} and follow it.`,
        `Build this Mateu UI definition${currentPath ? ` (file specs/ui/${currentPath})` : ''}:`,
        description.trim() || '(describe the screen here)',
        '',
        `Reply with a share link on this editor: ${editorBase.split('#')[0]}`,
    ].join('\n')
}
