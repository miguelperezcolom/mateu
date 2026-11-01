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
   * The extensions of the files a web app serves (scripts, styles, images, fonts, media, data). A
   * path whose last segment ends in one of them is a FILE; any other path — {@code
   * /people/ana.perez}, {@code /versions/1.2} — is a route, dots and all. Before, any dot made a
   * path a file, so a deep link to a record whose id has one (a username, a version) was a 404.
   */
  public static final String ASSET_EXTENSIONS =
      "js|mjs|cjs|map|css|html?|json|webmanifest|xml|txt|csv|pdf|png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?|woff2?|ttf|otf|eot|mp4|webm|ogg|mp3|wav|m4a|wasm|zip|gz|br|ya?ml|md|bcmap";

  /**
   * A path (or path segment) that does NOT end in an asset's extension, for the frameworks that
   * route by regex (JAX-RS {@code @Path}, Spring path patterns, Micronaut URI templates, Vert.x).
   * One negative lookahead per extension and the inline {@code (?i)} flag: no group and no colon,
   * because Spring rejects capturing groups in a path variable and Micronaut's URI template cuts
   * the regex at a colon ({@code (?:…)}, {@code (?i:…)}). Same extensions as {@link
   * #ASSET_EXTENSIONS} (a test keeps them in step).
   */
  public static final String NOT_AN_ASSET =
      "(?i)(?!.*\\.js$)(?!.*\\.mjs$)(?!.*\\.cjs$)(?!.*\\.map$)(?!.*\\.css$)(?!.*\\.html?$)"
          + "(?!.*\\.json$)(?!.*\\.webmanifest$)(?!.*\\.xml$)(?!.*\\.txt$)(?!.*\\.csv$)(?!.*\\.pdf$)"
          + "(?!.*\\.png$)(?!.*\\.jpe?g$)(?!.*\\.gif$)(?!.*\\.webp$)(?!.*\\.avif$)(?!.*\\.svg$)"
          + "(?!.*\\.ico$)(?!.*\\.bmp$)(?!.*\\.tiff?$)(?!.*\\.woff2?$)(?!.*\\.ttf$)(?!.*\\.otf$)"
          + "(?!.*\\.eot$)(?!.*\\.mp4$)(?!.*\\.webm$)(?!.*\\.ogg$)(?!.*\\.mp3$)(?!.*\\.wav$)"
          + "(?!.*\\.m4a$)(?!.*\\.wasm$)(?!.*\\.zip$)(?!.*\\.gz$)(?!.*\\.br$)(?!.*\\.ya?ml$)"
          + "(?!.*\\.md$)(?!.*\\.bcmap$).+";

  private static final java.util.regex.Pattern ASSET =
      java.util.regex.Pattern.compile(
          ".*\\.(?:" + ASSET_EXTENSIONS + ")$", java.util.regex.Pattern.CASE_INSENSITIVE);

  /** Whether {@code path} names a file: its last segment ends in an asset's extension. */
  public static boolean isAsset(String path) {
    if (path == null) {
      return false;
    }
    var query = path.indexOf('?');
    var bare = query < 0 ? path : path.substring(0, query);
    var last = bare.substring(bare.lastIndexOf('/') + 1);
    return ASSET.matcher(last).matches();
  }

  /**
   * Whether a GET to {@code path} is a candidate for the fallback at all: not an asset ({@link
   * #isAsset}), not the root itself, not an actuator/management path.
   */
  public static boolean candidate(String path) {
    return path != null
        && !path.equals("/")
        && !isAsset(path)
        && !path.startsWith("/actuator")
        // a parked document is fetched by navigating to it: it must reach its endpoint, never the
        // index page
        && !io.mateu.core.infra.documents.DocumentDownloads.isEndpoint(path)
        // the mobile app's manifest is JSON, never the index page
        && !MobileManifest.isEndpoint(path);
  }

  /**
   * Whether the request is a page NAVIGATION (a reload, a shared link), the only kind the index
   * page answers. A browser navigation always accepts {@code text/html}; a {@code fetch()}/XHR for
   * data (a REST source's {@code /api/products} that does not exist yet) does not — answering it
   * the index with a 200 made a missing endpoint look like an empty one, with nothing in any log.
   * No Accept header at all is treated as a navigation.
   */
  public static boolean acceptsHtml(String accept) {
    return accept == null || accept.isBlank() || accept.contains("text/html");
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
