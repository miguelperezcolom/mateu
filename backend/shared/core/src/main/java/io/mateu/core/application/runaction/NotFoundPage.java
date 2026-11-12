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
    var texts = textsFor(command.httpRequest());
    var path = pathOf(command.route());
    var id = lastSegment(path);
    var message = exception.getMessage();
    var userFacing =
        message != null && !message.isBlank() && !OPTIONAL_MESSAGE.equals(message.trim());
    String title;
    if (userFacing) {
      title = message;
    } else if (id != null) {
      title = texts.notFoundId() + id;
    } else {
      title = texts.notFound();
    }
    return page(title, texts, path);
  }

  /** The page for a route that resolves to nothing at all. */
  static NotFound forUnknownRoute(RunActionCommand command, YamlSpecProblems problems) {
    var texts = textsFor(command.httpRequest());
    var page = page(texts.pageNotFound(), texts, pathOf(command.route()));
    return io.mateu.core.infra.dev.DevMode.enabled() && problems != null
        ? withSpecProblems(page, problems.forRoute(pathOf(command.route()).substring(1)))
        : page;
  }

  /**
   * In development mode, a not-found page also says which definitions could not be read — the usual
   * reason a route that IS in routes.yaml answers "not found" (a typo in a key, an unknown {@code
   * dataType}, a layout file that does not exist). Never outside development mode: a production
   * page must not describe the server's files.
   */
  static NotFound withSpecProblems(NotFound page, java.util.List<String> problems) {
    if (problems.isEmpty()) {
      return page;
    }
    return NotFound.builder()
        .id(page.id())
        .title(page.title())
        .backRoute(page.backRoute())
        .backLabel(page.backLabel())
        .style(page.style())
        .cssClasses(page.cssClasses())
        .message(
            "Development mode — "
                + (problems.size() == 1
                    ? "a definition could not be read: "
                    : problems.size() + " definitions could not be read: ")
                + String.join(" · ", problems))
        .build();
  }

  private static NotFound page(String title, Texts texts, String path) {
    return NotFound.builder()
        .id("not-found")
        .title(title)
        .message(texts.message())
        .backRoute(parentOf(path))
        .backLabel(texts.back())
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

  /** The page's words in one language (the renderers' NOT_FOUND texts — Redwood content.mjs). */
  record Texts(
      String notFound, String notFoundId, String pageNotFound, String message, String back) {}

  static final java.util.Map<String, Texts> TEXTS =
      java.util.Map.of(
          "en",
          new Texts(
              "Not found",
              "Not found: ",
              "Page not found",
              "It may have been deleted, or the link is wrong.",
              "Go back"),
          "es",
          new Texts(
              "No encontrado",
              "No se ha encontrado ",
              "Página no encontrada",
              "Puede que se haya borrado o que el enlace no sea correcto.",
              "Volver"),
          "fr",
          new Texts(
              "Introuvable",
              "Introuvable : ",
              "Page introuvable",
              "Il a peut-être été supprimé, ou le lien est incorrect.",
              "Revenir"),
          "de",
          new Texts(
              "Nicht gefunden",
              "Nicht gefunden: ",
              "Seite nicht gefunden",
              "Möglicherweise wurde es gelöscht oder der Link ist falsch.",
              "Zurück"),
          "pt",
          new Texts(
              "Não encontrado",
              "Não encontrado: ",
              "Página não encontrada",
              "Pode ter sido excluído, ou o link está errado.",
              "Voltar"),
          "it",
          new Texts(
              "Non trovato",
              "Non trovato: ",
              "Pagina non trovata",
              "Potrebbe essere stato eliminato, oppure il link non è corretto.",
              "Torna indietro"));

  /**
   * The words for the browser's language (the primary subtag of its first {@code Accept-Language}:
   * {@code pt-BR} → pt, {@code de-AT} → de), English for one the page does not speak.
   */
  static Texts textsFor(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return TEXTS.get("en");
    }
    try {
      var acceptLanguage = httpRequest.getHeaderValue("Accept-Language");
      return TEXTS.getOrDefault(primaryLanguage(acceptLanguage), TEXTS.get("en"));
    } catch (RuntimeException e) {
      return TEXTS.get("en");
    }
  }

  static String primaryLanguage(String acceptLanguage) {
    if (acceptLanguage == null || acceptLanguage.isBlank()) {
      return "en";
    }
    var first = acceptLanguage.split(",")[0].split(";")[0].trim();
    return first.split("[-_]")[0].toLowerCase(java.util.Locale.ROOT);
  }
}
