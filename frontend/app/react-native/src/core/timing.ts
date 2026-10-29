/**
 * Startup timings: how long each step of opening a UI took (manifest, bundle, shell, first screen),
 * so "the app is slow to start" can be answered with numbers from a real phone. Logged as
 * `[Mateu timing] <step>: <n> ms` and kept (last 50) on `globalThis.__mateuTimings` for probes.
 */
export interface Timing {
  step: string;
  ms: number;
  /** Where the answer came from when a cache was involved (`cache`, `network`, `304`). */
  source?: string;
}

const kept: Timing[] = [];
const now = (): number => (globalThis.performance?.now ? globalThis.performance.now() : Date.now());

export function recordTiming(step: string, ms: number, source?: string): void {
  const t: Timing = source ? { step, ms: Math.round(ms), source } : { step, ms: Math.round(ms) };
  kept.push(t);
  if (kept.length > 50) kept.shift();
  (globalThis as Record<string, unknown>).__mateuTimings = kept;
  console.info(`[Mateu timing] ${step}: ${t.ms} ms${source ? ` (${source})` : ''}`);
}

/** Runs `work` and records how long it took. */
export async function timed<T>(step: string, work: () => Promise<T>, sourceOf?: (result: T) => string | undefined): Promise<T> {
  const t0 = now();
  const result = await work();
  recordTiming(step, now() - t0, sourceOf?.(result));
  return result;
}

export const timings = (): Timing[] => [...kept];
