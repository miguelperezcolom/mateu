package io.mateu.core.infra;

import java.util.Collection;

/**
 * The single-page-app fallback every adapter applies: a deep link ({@code /orders/42} on a reload
 * or a shared link) has no handler of its own, so it is answered with the index page of the UI that
 * owns it. Framework-neutral decision logic; each adapter wires it in its own way (a forwarding
 * filter in Spring MVC/WebFlux, catch-all index routes in the generated controllers elsewhere).
 */
public final class SpaFallback {

  private SpaFallback() {}

  /**
   * Whether a GET to {@code path} is a candidate for the fallback at all: not an asset (no dot in
   * it), not the root itself, not an actuator/management path.
   */
  public static boolean candidate(String path) {
    return path != null
        && !path.equals("/")
        && !path.contains(".")
        && !path.startsWith("/actuator")
        // a parked document is fetched by navigating to it: it must reach its endpoint, never the
        // index page
        && !io.mateu.core.infra.documents.DocumentDownloads.isEndpoint(path);
  }

  /**
   * Where a deep link is answered: the longest UI base URL the path lives under, else {@code /}
   * (the root UI) — or null for a path under {@code /mateu} that no UI owns (an API call, which
   * must 404 rather than answer a page).
   *
   * @param baseUrls the base URLs of the UIs served by the app ({@code ""} for the root UI is
   *     ignored, it is the default)
   */
  public static String target(String path, Collection<String> baseUrls) {
    String best = null;
    for (String baseUrl : baseUrls) {
      if (baseUrl == null || baseUrl.isEmpty() || "/".equals(baseUrl)) {
        continue;
      }
      if (path.startsWith(baseUrl + "/") && (best == null || baseUrl.length() > best.length())) {
        best = baseUrl;
      }
    }
    if (best != null) {
      return best;
    }
    return path.startsWith("/mateu") ? null : "/";
  }

  /** Whether {@code path} IS the index of one of the UIs (served by its own controller). */
  public static boolean isIndex(String path, Collection<String> baseUrls) {
    for (String baseUrl : baseUrls) {
      if (baseUrl != null && !baseUrl.isEmpty() && path.equals(baseUrl)) {
        return true;
      }
    }
    return false;
  }
}
