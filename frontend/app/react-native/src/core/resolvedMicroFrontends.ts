/**
 * A micro frontend the HOST resolved (`resolve = SERVER`) carries the remote's answer in
 * `metadata.resolved` — per-request content of another app. A port of libs/mateu's rule: what is
 * kept for later (the screen snapshots on the device) keeps the structure WITHOUT it, so a
 * snapshot never repaints another app's stale answer and the island asks its remote as usual.
 */
export function withoutResolvedMicroFrontends<T>(value: T): T {
  return strip(value) as T;
}

function strip(value: unknown): unknown {
  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((item) => {
      const next = strip(item);
      if (next !== item) changed = true;
      return next;
    });
    return changed ? out : value;
  }
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  if (record['type'] === 'MicroFrontend' && 'resolved' in record) {
    const { resolved: _dropped, ...rest } = record;
    return rest;
  }
  let out: Record<string, unknown> | undefined;
  for (const [key, child] of Object.entries(record)) {
    const next = strip(child);
    if (next !== child) {
      out = out ?? { ...record };
      out[key] = next;
    }
  }
  return out ?? value;
}

/**
 * The answer a MicroFrontend's host already fetched for it, as its view host's `preview`: painted
 * without asking, against the micro frontend's own route and type. Undefined = load it as usual.
 */
export function resolvedPreviewOf(metadata: Record<string, unknown>) {
  const resolved = metadata['resolved'];
  if (!resolved || typeof resolved !== 'object') return undefined;
  return {
    increment: resolved,
    route: (metadata['route'] as string) ?? '',
    consumedRoute: (metadata['consumedRoute'] as string) ?? '',
    serverSideType: (metadata['serverSideType'] as string) || undefined,
  };
}
