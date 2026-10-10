import { reauthenticateWithProvider } from './auth.ts';

/**
 * Session-expiry re-auth (parity with the web's `onSessionExpired`, libs/mateu sessionGuard). When a
 * Mateu request comes back 401 (the Bearer token expired mid-session), the app gets ONE chance to
 * re-authenticate before the call fails, and the original request is retried once — the user's
 * in-progress work (form state, wizard position) stays intact.
 *
 * Who re-authenticates, first wins:
 *  1. a handler registered with `onSessionExpired` (the app owns re-auth: its own login screen…);
 *  2. the registered `TokenProvider` (auth.ts — e.g. the built-in OIDC flow): silent refresh, then
 *     an interactive login;
 *  3. nobody → the 401 fails normally (no behaviour change).
 *
 * Concurrent 401s share ONE re-auth (single flight): three screens failing at once must not open
 * three login windows.
 */
export type SessionExpiredHandler = () => boolean | Promise<boolean>;

let handler: SessionExpiredHandler | undefined;
let inFlight: Promise<boolean> | undefined;

/** Register (or clear, with undefined) the re-auth handler. */
export const onSessionExpired = (h: SessionExpiredHandler | undefined): void => {
  handler = h;
};

const reauthenticate = async (): Promise<boolean> => {
  if (handler) {
    try {
      return await handler();
    } catch {
      return false;
    }
  }
  return reauthenticateWithProvider(true);
};

/**
 * Invoked by the API client on a 401. Returns true when the app re-authenticated and the caller
 * should retry once; false (nobody re-authenticates, it declined, or it threw) to fail normally.
 */
export const handleSessionExpired = (): Promise<boolean> => {
  if (!inFlight) {
    inFlight = reauthenticate().finally(() => {
      inFlight = undefined;
    });
  }
  return inFlight;
};
