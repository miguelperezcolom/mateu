package io.mateu.uidl.audit;

import io.mateu.uidl.annotations.Experimental;

/**
 * How a Mateu request ended — the {@code mateu.outcome} of its span and metrics, and the outcome an
 * {@link ActionAuditListener} hears.
 */
@Experimental
public enum ActionOutcome {
  /** The request was answered as asked. */
  OK,
  /**
   * The application refused it with a message meant for the user: a {@code UserFacingException} or
   * a validation error.
   */
  USER_ERROR,
  /** Refused (403): the caller may not see the route or run the action. */
  FORBIDDEN,
  /** The route, or the record it names, does not exist. */
  NOT_FOUND,
  /** A bug: the user saw "Something went wrong" with a reference id. */
  ERROR;

  /** The value used in telemetry attributes: {@code ok}, {@code user_error}, … */
  public String attributeValue() {
    return name().toLowerCase(java.util.Locale.ROOT);
  }
}
