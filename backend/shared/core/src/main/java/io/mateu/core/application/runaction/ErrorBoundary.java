package io.mateu.core.application.runaction;

import io.mateu.core.infra.MateuSettings;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationPosition;
import io.mateu.uidl.data.NotificationVariant;
import java.util.IdentityHashMap;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

/**
 * What the user is told when an action fails — the single error boundary of the request path.
 *
 * <ul>
 *   <li>a {@link UserFacingException} anywhere in the cause chain: its title and message, as the
 *       application wrote them;
 *   <li>a Bean Validation {@code ConstraintViolationException}: the declared constraint messages;
 *   <li>anything else is a bug: a generic message with a short reference id, and the exception
 *       logged at ERROR — stack trace included — under that same id, so support can find it. The
 *       raw class name and message used to go straight into the toast, and an exception message is
 *       written for developers: SQL, paths, hostnames, other users' data.
 * </ul>
 *
 * <p>{@value #DETAILED} ({@code MATEU_ERRORS_DETAILED}) restores the raw class and message in the
 * toast, for development. The .NET ({@code MateuExtensions}) and Python ({@code mateu_fastapi})
 * adapters apply the same boundary with the same texts.
 */
@Slf4j
public final class ErrorBoundary {

  public static final String DETAILED = "mateu.errors.detailed";
  public static final String GENERIC_TITLE = "Something went wrong";
  public static final String GENERIC_TEXT = "An unexpected error occurred. Reference: ";

  private ErrorBoundary() {}

  /** The toast for a failed action, logging it when it is not a message meant for the user. */
  public static Message toMessage(Throwable error, String actionId) {
    return toMessage(error, actionId, null);
  }

  /**
   * The same, for a request that may ask for the details itself: a request attribute {@value
   * #DETAILED} = true (set server-side only — by the bundle exporter, whose skip reasons are read
   * by the developer building it; never from anything the client sends).
   */
  public static Message toMessage(
      Throwable error, String actionId, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var userFacing = find(error, UserFacingException.class);
    if (userFacing != null) {
      log.debug("Action {} answered a user-facing error: {}", actionId, userFacing.getMessage());
      return message(
          userFacing.title() != null ? userFacing.title() : "Error", userFacing.getMessage());
    }
    var violations = find(error, jakarta.validation.ConstraintViolationException.class);
    if (violations != null) {
      return message("Validation error", describe(violations));
    }
    var reference = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    log.error("Error handling action {} [ref {}]", actionId, reference, error);
    if (MateuSettings.isTrue(DETAILED)
        || (httpRequest != null && Boolean.TRUE.equals(safeAttribute(httpRequest, DETAILED)))) {
      var source = source(error);
      return message(
          source.getClass().getSimpleName(),
          (source.getMessage() != null ? source.getMessage() : source.getClass().getName())
              + " (ref "
              + reference
              + ")");
    }
    return message(GENERIC_TITLE, GENERIC_TEXT + reference);
  }

  private static Object safeAttribute(
      io.mateu.uidl.interfaces.HttpRequest httpRequest, String key) {
    try {
      return httpRequest.getAttribute(key);
    } catch (RuntimeException e) {
      return null;
    }
  }

  private static Message message(String title, String text) {
    return Message.builder()
        .variant(NotificationVariant.error)
        .position(NotificationPosition.middle)
        .title(title)
        .text(text)
        .duration(0)
        .build();
  }

  private static String describe(jakarta.validation.ConstraintViolationException e) {
    if (e.getConstraintViolations() == null || e.getConstraintViolations().isEmpty()) {
      return e.getMessage();
    }
    return e.getConstraintViolations().stream()
        .map(
            v ->
                (v.getPropertyPath() != null && !v.getPropertyPath().toString().isBlank()
                        ? v.getPropertyPath() + ": "
                        : "")
                    + v.getMessage())
        .sorted()
        .collect(Collectors.joining("\n"));
  }

  /** The first throwable of {@code type} in the cause chain (cycle-safe), or null. */
  static <T extends Throwable> T find(Throwable error, Class<T> type) {
    Set<Throwable> seen = java.util.Collections.newSetFromMap(new IdentityHashMap<>());
    for (var t = error; t != null && seen.add(t); t = next(t)) {
      if (type.isInstance(t)) {
        return type.cast(t);
      }
    }
    return null;
  }

  private static Throwable next(Throwable t) {
    if (t instanceof java.lang.reflect.InvocationTargetException ite) {
      return ite.getTargetException();
    }
    return t.getCause();
  }

  /** The innermost cause: what actually went wrong, under the reflective/reactive wrappers. */
  static Throwable source(Throwable error) {
    Set<Throwable> seen = java.util.Collections.newSetFromMap(new IdentityHashMap<>());
    var t = error;
    while (seen.add(t) && next(t) != null) {
      t = next(t);
    }
    return t;
  }
}
