/**
 * The pure side of large file uploads through the app's storage port (design/uploads/
 * file-uploads-contract.md): the field's attributes, the `mateu-file:` reference value, size texts
 * and the shape of the upload endpoints' answers. The same rules as the React Native app's
 * src/core/fileUploads.ts (keep them in step); the texts the client says itself come from the
 * chrome catalogue.
 */
import { chromeText, chromeTextf } from './chromeTexts.ts'

/**
 * Whether `accept` (the input's comma list: `.pdf`, `image/*`, `application/pdf`) lets a file
 * through — the server's rule: `.ext` matches the name's extension, `type/*` the type's prefix,
 * anything else the exact type (case-insensitive, parameters dropped). Empty accept = anything.
 */
export function acceptsFile(accept: string | undefined, name: string, contentType: string | undefined): boolean {
  const entries = (accept ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!entries.length) return true;
  const lowerName = name.toLowerCase();
  const type = (contentType ?? '').split(';')[0].trim().toLowerCase();
  return entries.some((entry) => {
    if (entry.startsWith('.')) return lowerName.endsWith(entry);
    if (entry.endsWith('/*')) return type.startsWith(entry.slice(0, -1));
    return type === entry;
  });
}

/** The data-URI fallback's limit when the field declares none (10 MB). */
export const DEFAULT_FALLBACK_MAX_BYTES = 10485760;

/** What a fileUpload field declares (and what the server added: uploadUrl/uploadTicket/uploadDirect). */
export interface UploadConfig {
  accept?: string;
  /** Max size of ONE file, or undefined when undeclared. */
  maxBytes?: number;
  multiple: boolean;
  uploadUrl?: string;
  /** Its presence switches the field to upload mode. */
  uploadTicket?: string;
  uploadDirect: boolean;
}

/** A stored file, as the `mateu-file:` reference describes it. */
export interface FileRef {
  id: string;
  name?: string;
  contentType?: string;
  /** -1 / undefined = unknown. */
  size?: number;
  url?: string;
}

/** The wire's `attributes` (a list of {key, value} pairs) as a map; a map is accepted as well. */
export function attributesOf(attributes: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(attributes)) {
    for (const a of attributes) {
      if (a && typeof a === 'object' && typeof (a as { key?: unknown }).key === 'string') {
        const v = (a as { value?: unknown }).value;
        if (v !== undefined && v !== null) out[(a as { key: string }).key] = String(v);
      }
    }
  } else if (attributes && typeof attributes === 'object') {
    for (const [k, v] of Object.entries(attributes as Record<string, unknown>)) {
      if (v !== undefined && v !== null) out[k] = String(v);
    }
  }
  return out;
}

const nonBlank = (s: string | undefined): string | undefined => (s && s.trim() ? s.trim() : undefined);

export function uploadConfigOf(attributes: unknown): UploadConfig {
  const a = attributesOf(attributes);
  const max = a.maxBytes !== undefined && /^\d+$/.test(a.maxBytes.trim()) ? Number(a.maxBytes.trim()) : undefined;
  return {
    accept: nonBlank(a.accept),
    maxBytes: max,
    multiple: a.multiple?.trim().toLowerCase() === 'true',
    uploadUrl: nonBlank(a.uploadUrl),
    uploadTicket: nonBlank(a.uploadTicket),
    uploadDirect: a.uploadDirect?.trim().toLowerCase() === 'true',
  };
}

/** True when the field uploads through the server instead of reading the file into a data URI. */
export const isUploadMode = (c: UploadConfig): boolean => !!c.uploadTicket && !!c.uploadUrl;

/** The size limit the data-URI fallback applies. */
export const fallbackMaxBytes = (c: UploadConfig): number => c.maxBytes ?? DEFAULT_FALLBACK_MAX_BYTES;

/** `N bytes`, `N KB`, `N MB`, `N GB` (1024 base, integer when exact, else one decimal). */
export function formatBytes(bytes: number): string {
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (unit < units.length - 1 && value >= 1024) {
    value /= 1024;
    unit++;
  }
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${text} ${units[unit]}`;
}

export const tooLargeMessage = (maxBytes: number): string => chromeTextf('fileTooLarge', { max: formatBytes(maxBytes) });

/** Percent-encodes UTF-8, escaping every byte outside `A-Za-z0-9-._~`. */
export function percentEncode(text: string): string {
  return encodeURIComponent(text).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

/** Decodes `%XX` sequences only (`+` stays a plus); a malformed sequence leaves the text as it came. */
export function percentDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

const PREFIX = 'mateu-file:';

export const isFileRef = (value: unknown): value is string => typeof value === 'string' && value.startsWith(PREFIX);

/** A `mateu-file:` value, or null for anything else (a data URI, a url, blank). */
export function parseFileRef(value: unknown): FileRef | null {
  if (!isFileRef(value)) return null;
  const rest = value.slice(PREFIX.length);
  const q = rest.indexOf('?');
  const id = percentDecode(q < 0 ? rest : rest.slice(0, q));
  const ref: FileRef = { id };
  if (q >= 0) {
    for (const pair of rest.slice(q + 1).split('&')) {
      if (!pair) continue;
      const eq = pair.indexOf('=');
      const key = eq < 0 ? pair : pair.slice(0, eq);
      const v = percentDecode(eq < 0 ? '' : pair.slice(eq + 1));
      if (key === 'name') ref.name = v;
      else if (key === 'type') ref.contentType = v;
      else if (key === 'url') ref.url = v;
      else if (key === 'size' && /^\d+$/.test(v)) ref.size = Number(v);
    }
  }
  return ref;
}

/** The reference value of a stored file (params in the contract's order; absent ones omitted). */
export function toFileRef(file: FileRef): string {
  const params: string[] = [];
  if (file.name) params.push('name=' + percentEncode(file.name));
  if (file.contentType) params.push('type=' + percentEncode(file.contentType));
  if (file.size !== undefined && file.size >= 0) params.push('size=' + file.size);
  if (file.url) params.push('url=' + percentEncode(file.url));
  return PREFIX + percentEncode(file.id) + (params.length ? '?' + params.join('&') : '');
}

export const isHttpUrl = (url: string | undefined): boolean => !!url && /^https?:\/\//i.test(url.trim());

/** What the field shows for a stored file: its name (else its id), with its size when known. */
export function fileRefLabel(ref: FileRef): string {
  const name = ref.name || ref.id;
  return ref.size !== undefined && ref.size >= 0 ? `${name} · ${formatBytes(ref.size)}` : name;
}

/** The field's value as a list of entries (a single value → one entry; blank → none). */
export function valuesOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => v !== null && v !== undefined && String(v) !== '').map(String);
  if (value === null || value === undefined || String(value) === '') return [];
  return [String(value)];
}

/** The value after a file was committed: appended for a `multiple` field, replaced otherwise. */
export function withFile(current: unknown, added: string, multiple: boolean): unknown {
  return multiple ? [...valuesOf(current), added] : added;
}

/** The value after the entry at `index` was removed. */
export function withoutFile(current: unknown, index: number, multiple: boolean): unknown {
  if (!multiple) return '';
  const list = valuesOf(current);
  list.splice(index, 1);
  return list;
}

/**
 * Where to send the bytes: an absolute http(s) `uploadUrl` as it is; a root-relative one against the
 * ORIGIN of the backend the UI talks to (the upload endpoints live at the root path); a bare relative
 * one against the base url. A relative base url (expo web, same origin) leaves it relative.
 */
export function resolveUploadUrl(baseUrl: string, uploadUrl: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(uploadUrl)) return uploadUrl;
  if (!/^https?:\/\//i.test(baseUrl)) return uploadUrl;
  try {
    const base = baseUrl.endsWith('/') || uploadUrl.startsWith('/') ? baseUrl : baseUrl + '/';
    return new URL(uploadUrl, base).toString();
  } catch {
    return uploadUrl;
  }
}

/** The headers of the streamed upload (beside the app's own Mateu credentials). */
export function uploadHeaders(ticket: string, name: string, contentType: string | undefined): Record<string, string> {
  return {
    'X-Mateu-Upload-Ticket': ticket,
    'X-Mateu-File-Name': percentEncode(name),
    'Content-Type': contentType || 'application/octet-stream',
    Accept: 'application/json',
  };
}

/** A pre-signed target (`POST uploadUrl/target` answered 200). */
export interface UploadTarget {
  url: string;
  method: string;
  headers: Record<string, string>;
  value: string;
}

const jsonOf = (text: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

/** The committed value of a 200 from `/mateu/v3/upload`, or null when the answer has none. */
export function uploadedValueOf(text: string): string | null {
  const v = jsonOf(text)?.value;
  return typeof v === 'string' && v ? v : null;
}

export function uploadTargetOf(text: string): UploadTarget | null {
  const json = jsonOf(text);
  if (!json || typeof json.url !== 'string' || typeof json.value !== 'string') return null;
  const headers: Record<string, string> = {};
  if (json.headers && typeof json.headers === 'object') {
    for (const [k, v] of Object.entries(json.headers as Record<string, unknown>)) if (v !== null && v !== undefined) headers[k] = String(v);
  }
  return { url: json.url, method: typeof json.method === 'string' && json.method ? json.method : 'PUT', headers, value: json.value };
}

/** The server's `message` of a refused upload, else a plain text for its status. */
export function uploadErrorOf(status: number, text: string): string {
  const message = jsonOf(text)?.message;
  if (typeof message === 'string' && message) return message;
  if (status === 403) return chromeText('uploadNotAllowed');
  if (status === 404) return chromeText('uploadsNotAvailable');
  if (status === 415) return chromeText('fileNotAccepted');
  if (status === 0) return chromeText('uploadNotSent');
  return chromeText('uploadFailed');
}
