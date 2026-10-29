import { Platform } from 'react-native';
import { bundleFromText, fetchStaticBundle, type BundleFetch } from '../core/staticBundle.ts';
import { recordTiming } from '../core/timing.ts';

/** Where a static UI's bundle text and its ETag are kept between launches. */
export interface BundleStore {
  get(key: string): Promise<{ text: string; etag?: string } | null>;
  put(key: string, text: string, etag?: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/** The cache key of a bundle: its UI and its path. */
export const bundleKey = (baseUrl: string, path: string): string => `${baseUrl}|${path}`;

/** A small stable hash for a file name (the key itself may carry `/`, `:`…). */
function fileNameOf(key: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0;
  for (let i = 0; i < key.length; i++) {
    h1 = Math.imul(h1 ^ key.charCodeAt(i), 16777619) >>> 0;
    h2 = (Math.imul(h2, 31) + key.charCodeAt(i)) >>> 0;
  }
  return `b${h1.toString(16)}${h2.toString(16)}`;
}

/**
 * The device's store: files under the app's documents (a bundle is ~1 MB — too big for
 * AsyncStorage / SecureStore). The web build keeps nothing: the browser's HTTP cache already
 * revalidates with the ETag there.
 */
export const fileBundleStore: BundleStore = {
  async get(key) {
    if (Platform.OS === 'web') return null;
    try {
      const { Directory, File, Paths } = await import('expo-file-system');
      const dir = new Directory(Paths.document, 'mateu-bundles');
      const body = new File(dir, `${fileNameOf(key)}.json`);
      if (!body.exists) return null;
      const meta = new File(dir, `${fileNameOf(key)}.etag`);
      return { text: await body.text(), etag: meta.exists ? (await meta.text()) || undefined : undefined };
    } catch {
      return null;
    }
  },
  async put(key, text, etag) {
    if (Platform.OS === 'web') return;
    try {
      const { Directory, File, Paths } = await import('expo-file-system');
      const dir = new Directory(Paths.document, 'mateu-bundles');
      if (!dir.exists) dir.create({ intermediates: true });
      const body = new File(dir, `${fileNameOf(key)}.json`);
      body.write(text);
      const meta = new File(dir, `${fileNameOf(key)}.etag`);
      if (etag) meta.write(etag);
      else if (meta.exists) meta.delete();
    } catch {
      // no cache: the next open downloads it again
    }
  },
  async remove(key) {
    if (Platform.OS === 'web') return;
    try {
      const { Directory, File, Paths } = await import('expo-file-system');
      const dir = new Directory(Paths.document, 'mateu-bundles');
      for (const ext of ['json', 'etag']) {
        const f = new File(dir, `${fileNameOf(key)}.${ext}`);
        if (f.exists) f.delete();
      }
    } catch {
      // ignore
    }
  },
};

/**
 * A static UI's bundle, answered from the device when it has a copy — at once — while the copy is
 * revalidated in the background (If-None-Match: a 304 costs a few bytes, a new build replaces the
 * copy for the NEXT open). Without a copy, it is downloaded and kept.
 */
export async function cachedStaticBundle(
  baseUrl: string,
  path: string,
  deps: { store?: BundleStore; fetch?: typeof fetchStaticBundle; onRevalidated?: (outcome: string) => void } = {},
): Promise<BundleFetch> {
  const store = deps.store ?? fileBundleStore;
  const fetchBundle = deps.fetch ?? fetchStaticBundle;
  const key = bundleKey(baseUrl, path);
  const t0 = Date.now();
  const hit = await store.get(key);
  const cached = hit ? bundleFromText(hit.text, baseUrl) : null;
  if (hit && cached) {
    recordTiming('bundle', Date.now() - t0, 'cache');
    void (async () => {
      const fresh = await fetchBundle(baseUrl, path, { ifNoneMatch: hit.etag });
      if (fresh.ok && fresh.text) await store.put(key, fresh.text, fresh.etag);
      deps.onRevalidated?.(fresh.ok ? 'updated' : 'notModified' in fresh ? 'notModified' : 'failed');
    })();
    return { ok: true, bundle: cached };
  }
  const fresh = await fetchBundle(baseUrl, path);
  recordTiming('bundle', Date.now() - t0, 'network');
  if (fresh.ok && fresh.text) await store.put(key, fresh.text, fresh.etag);
  return fresh;
}
