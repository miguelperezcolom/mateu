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
  const store = deps.store ?? (await import('./bundleFileStore.ts')).fileBundleStore;
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
