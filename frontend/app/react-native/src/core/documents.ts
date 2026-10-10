/**
 * Documents on React Native — the pure half (no react-native imports, unit-tested in node).
 *
 * A `DownloadFile` command (an action returned a `Document`, or a listing export) carries the
 * bytes inline (`base64Content`) or a short-lived, single-use `url` under the UI's base URL. A phone
 * has no "new tab" and no "Save as…", so the renderer maps the web's two dispositions onto what the
 * platform offers ({@link ./documentEffects}):
 *
 *  - a document behind a URL opens in the system browser sheet (expo-web-browser), which previews
 *    a PDF and offers share / save / print from there;
 *  - inline bytes are written to the app's cache directory and handed to the OS share sheet (iOS:
 *    Quick Look preview, Files, Print, AirDrop; Android: the apps that open the type).
 *
 * `print` and the `Print` command have no native equivalent here without a print module: a
 * document marked `print` takes the same path (print it from the preview/share sheet), and `Print`
 * of the current screen is announced as not available (see the docs page).
 */

export interface FileDownloadData {
  filename?: string;
  mimeType?: string;
  base64Content?: string;
  url?: string;
  disposition?: string;
  print?: boolean;
}

export type DocumentPlan =
  | { kind: 'url'; url: string; filename: string; mimeType: string; inline: boolean }
  | { kind: 'file'; base64: string; filename: string; mimeType: string; inline: boolean };

/** A name safe as a file in the cache directory: no path, no control characters. */
export function safeFileName(filename: string | undefined): string {
  const cleaned = (filename ?? '')
    .replace(/[\u0000-\u001f\u007f/\\:*?"<>|]/g, '_')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 120);
  return cleaned || 'document';
}

/**
 * The URL to open, or undefined: a same-site path is resolved against the backend's base URL (the
 * app talks to an absolute one); only http(s) is ever followed.
 */
export function documentUrl(url: string | undefined, baseUrl: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith('/') || url.startsWith('//')) return undefined;
  const origin = /^(https?:\/\/[^/]+)/i.exec(baseUrl ?? '')?.[1];
  return origin ? origin + url : undefined;
}

/** What to do with a `DownloadFile` payload, or null when there is nothing usable in it. */
export function planDocument(data: FileDownloadData | null | undefined, baseUrl: string): DocumentPlan | null {
  if (!data || typeof data !== 'object') return null;
  const filename = safeFileName(data.filename);
  const mimeType = data.mimeType || 'application/octet-stream';
  const inline = data.disposition === 'inline';
  if (data.base64Content) {
    return { kind: 'file', base64: data.base64Content, filename, mimeType, inline };
  }
  const url = documentUrl(data.url, baseUrl);
  return url ? { kind: 'url', url, filename, mimeType, inline } : null;
}

/** The iOS uniform type identifier of a media type (for a share sheet that needs one). */
export function utiOf(mimeType: string): string | undefined {
  const base = mimeType.split(';')[0].trim().toLowerCase();
  const map: Record<string, string> = {
    'application/pdf': 'com.adobe.pdf',
    'text/csv': 'public.comma-separated-values-text',
    'text/plain': 'public.plain-text',
    'image/png': 'public.png',
    'image/jpeg': 'public.jpeg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'org.openxmlformats.spreadsheetml.sheet',
  };
  return map[base];
}
