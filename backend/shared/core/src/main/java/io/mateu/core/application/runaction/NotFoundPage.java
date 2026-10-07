package io.mateu.core.application.runaction;

import io.mateu.uidl.data.NotFound;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.NoSuchElementException;
import java.util.Set;

/**
 * The not-found page a route answers when what it names does not exist.
 *
 * <p>Two ways in, one page. A view (its constructor, a {@code view(id)}, a CRUD's {@code findById},
 * anything that runs while the route LOADS) throws {@link NoSuchElementException} — the idiom for
 * "there is no such record", and what {@code Optional.orElseThrow()} throws — or the route resolves
 * to nothing at all. Before, the first was logged as an ERROR with its stack and answered with an
 * error toast over an empty page, and the second answered a bare red {@code "Not found."} text.
 *
 * <p>The exception's message is the heading when it reads like one: apps are expected to throw
 * user-facing messages ({@code «Reserva FO-X6JB7F no encontrada»}). With no message — or {@code
 * Optional}'s own {@code "No value present"}, which says nothing to a user — the heading is a
 * generic text naming the missing id (the route's last segment), in Spanish or English after the
 * request's {@code Accept-Language}.
 */
public final class NotFoundPage {

  /** What {@link java.util.Optional#orElseThrow()} says: not something to show a user. */
  private static final String OPTIONAL_MESSAGE = "No value present";

  private NotFoundPage() {}

  /**
   * Whether the action is a LOAD of the route — the only time a missing record means a missing
   * page. A button that throws {@link NoSuchElementException} on a screen that exists keeps today's
   * error message: replacing the screen under the user's click would be wrong.
   */
  static boolean isLoad(String actionId) {
    return actionId == null || actionId.isBlank() || "__load__".equals(actionId);
  }

  /** The {@link NoSuchElementException} behind {@code error}, unwrapping causes and reflection. */
  public static NoSuchElementException find(Throwable error) {
    Set<Throwable> seen = Collections.newSetFromMap(new IdentityHashMap<>());
    var current = error;
    while (current != null && seen.add(current)) {
      if (current instanceof NoSuchElementException notFound) {
        return notFound;
      }
      current =
          current instanceof InvocationTargetException ite && ite.getTargetException() != null
              ? ite.getTargetException()
              : current.getCause();
    }
    return null;
  }

  /** The page for a route whose load threw {@code exception}. */
  static NotFound forMissing(NoSuchElementException exception, RunActionCommand command) {
    var spanish = spanish(command.httpRequest());
    var path = pathOf(command.route());
    var id = lastSegment(path);
    var message = exception.getMessage();
    var userFacing =
        message != null && !message.isBlank() && !OPTIONAL_MESSAGE.equals(message.trim());
    String title;
    if (userFacing) {
      title = message;
    } else if (id != null) {
      title = spanish ? "No se ha encontrado " + id : "Not found: " + id;
    } else {
      title = spanish ? "No encontrado" : "Not found";
    }
    return page(title, spanish, path);
  }

  /** The page for a route that resolves to nothing at all. */
  static NotFound forUnknownRoute(RunActionCommand command) {
    var spanish = spanish(command.httpRequest());
    return page(
        spanish ? "Página no encontrada" : "Page not found", spanish, pathOf(command.route()));
  }

  private static NotFound page(String title, boolean spanish, String path) {
    return NotFound.builder()
        .id("not-found")
        .title(title)
        .message(
            spanish
                ? "Puede que se haya borrado o que el enlace no sea correcto."
                : "It may have been deleted, or the link is wrong.")
        .backRoute(parentOf(path))
        .backLabel(spanish ? "Volver" : "Go back")
        .build();
  }

  /** The route without its query and trailing slashes, always starting with {@code /}. */
  static String pathOf(String route) {
    if (route == null) {
      return "/";
    }
    var q = route.indexOf('?');
    var path = q >= 0 ? route.substring(0, q) : route;
    while (path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }
    return path.startsWith("/") ? path : "/" + path;
  }

  /** The last segment of the path — the id of a record route ({@code /reservas/FO-X6JB7F}). */
  static String lastSegment(String path) {
    var slash = path.lastIndexOf('/');
    var segment = path.substring(slash + 1);
    return segment.isBlank() || "_empty".equals(segment) ? null : segment;
  }

  /**
   * Where the way back goes: the parent route ({@code /reservas/FO-X6JB7F} → {@code /reservas}), or
   * the app's home ({@code /}) for a top-level route.
   */
  static String parentOf(String path) {
    var slash = path.lastIndexOf('/');
    return slash <= 0 ? "/" : path.substring(0, slash);
  }

  private static boolean spanish(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return false;
    }
    try {
      var acceptLanguage = httpRequest.getHeaderValue("Accept-Language");
      return acceptLanguage != null
          && acceptLanguage.trim().toLowerCase(java.util.Locale.ROOT).startsWith("es");
    } catch (RuntimeException e) {
      return false;
    }
  }
}
