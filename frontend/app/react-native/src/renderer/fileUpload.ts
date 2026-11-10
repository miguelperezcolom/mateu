// The pure side of the @FileUpload field (tested by node's runner): what an `accept` list lets the
// phone's pickers offer, and how a value — a data URI — is described.

/** Whether an `accept` list (".pdf,.txt", "image/*", empty = anything) takes pictures or videos —
 *  what the photo library can hand over. */
export function acceptsMedia(accept: string | null | undefined): boolean {
  const parts = (accept ?? '').split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (parts.length === 0) return true;
  return parts.some((p) => p.startsWith('image/') || p.startsWith('video/')
    || /^\.(png|jpe?g|gif|webp|heic|heif|bmp|svg|mp4|mov|m4v|webm)$/.test(p));
}

/** A data URI's type and size ("PDF · 12 KB"), or the value's last path segment for a url. */
export function fileValueSummary(value: string, name?: string): string {
  if (!value) return '';
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(value);
  if (!m) return name ?? decodeURIComponent(value.split(/[?#]/)[0].split('/').pop() ?? value);
  const mime = (m[1] ?? 'application/octet-stream').toLowerCase();
  const bytes = m[2] ? Math.floor((m[3].length * 3) / 4) - (m[3].endsWith('==') ? 2 : m[3].endsWith('=') ? 1 : 0) : m[3].length;
  const kind = (mime.split('/')[1] ?? mime).split(/[+.;-]/)[0].toUpperCase();
  const size = bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${name ? `${name} · ` : ''}${kind} · ${size}`;
}
