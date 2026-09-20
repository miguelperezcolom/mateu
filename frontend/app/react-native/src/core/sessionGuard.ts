/**
 * Session-expiry re-auth (parity with the web's `onSessionExpired`, libs/mateu sessionGuard). When a
 * Mateu request comes back 401 (the Bearer token expired mid-session), the app gets ONE chance to
 * re-authenticate before the call fails. Register a handler that re-auths however the app does it
 * (refresh a token, prompt for credentials) and returns whether the caller should retry.
 *
 * Opt-in: with no handler registered, a 401 fails normally (no behaviour change). The client retries
 * the original request at most once.
 */
export type SessionExpiredHandler = () => boolean | Promise<boolean>;

let handler: SessionExpiredHandler | undefined;

/** Register (or clear, with undefined) the re-auth handler. */
export const onSessionExpired = (h: SessionExpiredHandler | undefined): void => {
  handler = h;
};

/**
 * Invoked by the API client on a 401. Returns true when the app re-authenticated and the caller
 * should retry once; false (no handler, the handler declined, or it threw) to fail normally.
 */
export const handleSessionExpired = async (): Promise<boolean> => {
  if (!handler) return false;
  try {
    return await handler();
  } catch {
    return false;
  }
};
