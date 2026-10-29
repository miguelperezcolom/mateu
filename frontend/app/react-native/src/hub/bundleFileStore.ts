import { Platform } from 'react-native';
import type { BundleStore } from './bundleCache.ts';

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

