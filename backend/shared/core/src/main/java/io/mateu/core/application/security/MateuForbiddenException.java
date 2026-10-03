package io.mateu.core.application.security;

/**
 * A request the server refuses to run, whatever the caller's credentials: it names a server-side
 * type the application does not expose, or an action that is not an action (or that the caller's
 * token does not allow). Adapters answer it with HTTP 403 and no body detail; the reason is logged
 * server-side only, so the response is not an oracle about the classpath.
 */
public class MateuForbiddenException extends RuntimeException {

  public static final int STATUS = 403;

  public MateuForbiddenException(String message) {
    super(message);
  }

  /** The HTTP status adapters answer with. */
  public int status() {
    return STATUS;
  }

  /** What travels to the client: deliberately generic. */
  public static String publicMessage() {
    return "Forbidden";
  }

  /** Whether {@code error}, or any of its causes, is a {@link MateuForbiddenException}. */
  public static MateuForbiddenException find(Throwable error) {
    var current = error;
    for (int depth = 0; current != null && depth < 16; depth++) {
      if (current instanceof MateuForbiddenException forbidden) {
        return forbidden;
      }
      current = current.getCause();
    }
    return null;
  }
}
