// The transport's answer to "the backend is slow or unreachable" — the React Native port of
// libs/mateu's requestPolicy.ts + retryPolicy.ts (same kinds, same texts, same retry rule), so a
// failure reads the same on every renderer. Pure TypeScript, tested by node's runner.

/** A Mateu (or REST) answer with a non-2xx status. The message keeps the `HTTP <status>: <body>` shape
 *  the rest of the client already reads (isNoServer, loadFailureMessage). */
export class HttpStatusError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`HTTP ${status}: ${body}`);
    this.name = 'HttpStatusError';
    this.status = status;
    this.body = body;
  }
}

/** No answer in time (`@Action(timeoutMillis)`, else the default ceiling). */
export class RequestTimeoutError extends Error {
  readonly timeoutMillis: number;
  constructor(timeoutMillis: number) {
    super(`timeout: no answer after ${timeoutMillis} ms`);
    this.name = 'RequestTimeoutError';
    this.timeoutMillis = timeoutMillis;
  }
}

export type FailureKind = 'offline' | 'timeout' | 'server' | 'unauthorized' | 'forbidden' | 'notFound' | 'client' | 'unreadable' | 'unknown';

export interface RequestFailure {
  kind: FailureKind;
  /** Written for the user, not for the console. */
  message: string;
  /** Whether sending the very same request again could plausibly succeed. */
  retryable: boolean;
  status?: number;
}

const statusText = (status?: number) => (status ? ` (error ${status})` : '');

const MESSAGES: Record<FailureKind, (status?: number) => string> = {
  offline: () => 'No connection. Your changes have not been sent — check your network and try again.',
  timeout: () => 'The server is taking too long to answer. Your changes may not have been saved.',
  server: (s) => `The server could not complete the request${statusText(s)}. Please try again.`,
  unauthorized: () => 'Your session is no longer valid. Please sign in again.',
  forbidden: () => 'You are not allowed to do this.',
  notFound: () => 'This is no longer available. It may have been moved or deleted.',
  client: (s) => `The request was rejected${statusText(s)}.`,
  // a page of HTML where data was expected ("Unexpected token '<' … is not valid JSON")
  unreadable: () => 'The server sent an answer this app cannot read. Please try again later.',
  unknown: () => 'Something went wrong. Please try again.',
};

const RETRYABLE = new Set<FailureKind>(['offline', 'timeout', 'server']);

/** What a transport failure means, for the user. `online` = what the platform says (a NEGATIVE only). */
export function classifyFailure(error: unknown, online = true): RequestFailure {
  const failure = (kind: FailureKind, status?: number): RequestFailure => ({ kind, message: MESSAGES[kind](status), retryable: RETRYABLE.has(kind), status });
  if (error instanceof RequestTimeoutError) return failure('timeout');
  const status = error instanceof HttpStatusError ? error.status : statusOfMessage(error);
  const text = error instanceof Error ? error.message : String(error ?? '');
  if (status === undefined) {
    if (!online) return failure('offline');
    if (/unexpected token|is not valid json|json parse error|unexpected end of json|unrecognized token/i.test(text)) return failure('unreadable');
    if (/timeout|timed out/i.test(text)) return failure('timeout');
    if (error instanceof TypeError || /failed to fetch|network request failed|networkerror|load failed|fetch failed/i.test(text)) return failure('offline');
    return failure('unknown');
  }
  if (status === 401) return failure('unauthorized', status);
  if (status === 403) return failure('forbidden', status);
  if (status === 404 || status === 410) return failure('notFound', status);
  if (status === 408 || status === 429) return failure('timeout', status);
  if (status >= 500) return failure('server', status);
  if (status >= 400) return failure('client', status);
  return failure('unknown', status);
}

function statusOfMessage(error: unknown): number | undefined {
  const text = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  const m = /^(?:HTTP|External REST fetch failed:)\s*(\d{3})\b/.exec(text);
  return m ? Number(m[1]) : undefined;
}

/** Just the user-facing text. */
export function describeFailure(error: unknown, online = true): string {
  return classifyFailure(error, online).message;
}

// ── retries ─────────────────────────────────────────────────────────────────────────────────

const ALWAYS_SAFE = new Set(['', '__load__', 'search', '_globalsearch', '_notifications-list']);
const SAFE_PREFIXES = ['_appcontext-search-', 'search-'];

/** Whether repeating `actionId` is harmless: a route load, a search, or an `@Action(idempotent)`. */
export function isIdempotentAction(actionId: string | null | undefined, declared?: boolean): boolean {
  if (declared === true) return true;
  if (actionId === undefined || actionId === null) return false;
  if (ALWAYS_SAFE.has(actionId)) return true;
  return SAFE_PREFIXES.some((p) => actionId.startsWith(p));
}

export const MAX_RETRIES = 2;

/** 300 ms, then ×3, each ±25% (jitter so a recovering server is not hit by every client at once). */
export function retryDelayMs(attempt: number, random: () => number = Math.random): number {
  const base = 300 * Math.pow(3, Math.max(0, attempt - 1));
  return Math.round(base * (0.75 + random() * 0.5));
}

/** Whether attempt N (1-based) of a failed request may be repeated: idempotent, timeouts and 5xx only. */
export function shouldRetry(failure: RequestFailure, attempt: number, idempotent: boolean): boolean {
  if (!idempotent || attempt > MAX_RETRIES || !failure.retryable) return false;
  return failure.kind === 'timeout' || failure.kind === 'server';
}

/** The ceiling of a request that declares none (the web's axios default is no ceiling at all; an
 *  answer that never comes would leave the control busy forever). */
export const DEFAULT_TIMEOUT_MS = 60_000;
