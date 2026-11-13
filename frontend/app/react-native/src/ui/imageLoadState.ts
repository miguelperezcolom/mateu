/**
 * The load state of one image the renderer draws from a URL or a data URI (ui/LoadingImage.tsx):
 * a placeholder while it loads, the picture once it has, a broken-image fallback when it failed —
 * never an empty box. A local asset (`require(...)`, a number) is already there: it is `loaded` from
 * the start and shows no spinner.
 *
 * Pure (no React / RN imports).
 */
export type ImageLoadState = 'loading' | 'loaded' | 'error';

export type ImageLoadEvent =
  /** The image's source (re)arrived: a new uri starts over. */
  | { type: 'source'; source: unknown }
  | { type: 'start' }
  | { type: 'load' }
  | { type: 'error' }
  /** Fired after either outcome; settles a load whose `load` event the platform skipped. */
  | { type: 'end' };

/** The uri a source asks the network (or a data: decoder) for; null for a local asset / no source. */
export function remoteUriOf(source: unknown): string | null {
  const first = Array.isArray(source) ? source[0] : source;
  if (!first || typeof first !== 'object') return null;
  const uri = (first as { uri?: unknown }).uri;
  return typeof uri === 'string' && uri.trim() !== '' ? uri : null;
}

/** Where an image starts: a remote/data uri loads; anything else (a bundled asset) is there already. */
export function initialImageState(source: unknown): ImageLoadState {
  return remoteUriOf(source) ? 'loading' : 'loaded';
}

export function imageLoadReducer(state: ImageLoadState, event: ImageLoadEvent): ImageLoadState {
  switch (event.type) {
    case 'source':
      return initialImageState(event.source);
    case 'start':
      // a retry of the same source after a failure starts over; a loaded one stays (cache hits re-fire it)
      return state === 'error' ? 'loading' : state;
    case 'load':
      return 'loaded';
    case 'error':
      return 'error';
    case 'end':
      return state === 'loading' ? 'loaded' : state;
  }
}
