/**
 * The value an uploadable image takes from a URL the user typed or pasted ("Use a URL" next to
 * Upload): an http(s) URL or a path on this site, trimmed; undefined for anything else — a blank
 * (Delete clears the image), a `data:` URI (that is what Upload produces, not something to paste)
 * or a script/other scheme. The value is shown in an <img>, so only fetchable locations pass.
 * Redwood applies the same rule (poc/core/fields imageUrlOf).
 */
export function imageUrlOf(text: unknown): string | undefined {
    if (typeof text !== 'string') return undefined
    // eslint-disable-next-line no-control-regex
    const url = text.replace(/[\u0000-\u001f\u007f]/g, '').trim()
    if (!url) return undefined
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(url)?.[1]?.toLowerCase()
    if (scheme) return scheme === 'http' || scheme === 'https' ? url : undefined
    if (url.startsWith('//')) return undefined
    return url
}
