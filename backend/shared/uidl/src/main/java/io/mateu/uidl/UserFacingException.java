package io.mateu.uidl;

/**
 * An error whose message is MEANT for the user: throw it from an action (or anything an action
 * calls) and its message is shown in the error toast as written, with its optional title.
 *
 * <p>Every other exception is treated as a bug, not a message: the user sees a generic "Something
 * went wrong" with a reference id, and the exception — class, message and stack trace — is logged
 * at ERROR under that same id. An exception's message is written for developers and routinely
 * carries what a user must not see: SQL, file paths, hostnames, other users' data. Set {@code
 * mateu.errors.detailed=true} (system property or {@code MATEU_ERRORS_DETAILED}) in development to
 * see the raw class and message in the toast again.
 *
 * <pre>{@code
 * if (stock < qty) {
 *   throw new UserFacingException("Not enough stock", "Only " + stock + " units left.");
 * }
 * }</pre>
 *
 * <p>Bean Validation errors ({@code jakarta.validation.ConstraintViolationException}) are shown to
 * the user as well: their messages are the constraint messages the application declared.
 */
public class UserFacingException extends RuntimeException {

  private final String title;

  public UserFacingException(String message) {
    this(null, message, null);
  }

  public UserFacingException(String title, String message) {
    this(title, message, null);
  }

  public UserFacingException(String message, Throwable cause) {
    this(null, message, cause);
  }

  public UserFacingException(String title, String message, Throwable cause) {
    super(message, cause);
    this.title = title;
  }

  /** The toast's title; null for the default ("Error"). */
  public String title() {
    return title;
  }
}
