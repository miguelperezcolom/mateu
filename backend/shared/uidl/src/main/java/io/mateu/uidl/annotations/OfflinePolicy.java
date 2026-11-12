package io.mateu.uidl.annotations;

/**
 * What a client without connection does with an action ({@link Action#offline()}).
 *
 * <p>Only the native app has an outbox today; the web renderers ignore it.
 */
@Experimental("offline send queue (3.0 GA)")
public enum OfflinePolicy {
  /** The action fails while there is no connection, as any other request (the default). */
  FAIL,
  /**
   * The app keeps the request (the form's state, the action, the route) and sends it when the
   * connection is back, with an {@code Idempotency-Key} header the server uses to run it at most
   * once. Only for writes that still make sense later, after other changes may have happened.
   */
  QUEUE
}
