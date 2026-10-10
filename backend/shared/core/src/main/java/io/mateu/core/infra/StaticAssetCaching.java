package io.mateu.core.infra;

import java.time.Duration;
import java.util.List;

/**
 * How Mateu's own static assets are cached by the browser — the single source for every adapter
 * that serves them (the Spring MVC and WebFlux ones register resource handlers from it).
 *
 * <p>Without it, an app with Spring Security serves the frontend bundles with Spring Security's
 * default {@code Cache-Control: no-cache, no-store, max-age=0, must-revalidate}: nothing upstream
 * sets a policy, so the security header writer adds its own, and every page load downloads every
 * bundle again (the Vaadin bundle alone is ~900 KB, Redwood's app bundle ~780 KB).
 *
 * <ul>
 *   <li><b>Immutable</b> — the {@code /version_<n>/…} of Redwood jars built before 2026-10: the
 *       build stamped a new number into the path whenever the bundle changed, so the bytes behind a
 *       given path never change. Cached for a year and never revalidated.
 *   <li><b>Revalidate</b> — the assets whose names are fixed across releases (the Vaadin renderer's
 *       {@code /assets/mateu-vaadin.js} and its chunks, keycloak.min.js, the Redwood app under its
 *       stable {@code /_redwood/…}, whose loads also carry a {@code ?v=<source hash>}): {@code
 *       no-cache}, so the browser keeps them and asks, and an unchanged file costs a 304 with no
 *       body (ETag and Last-Modified are both sent).
 * </ul>
 *
 * <p>Spring Security's cache-control writer only adds its headers when the response has none, so a
 * policy set by the resource handler wins over it. Disable with {@code
 * mateu.static-assets.caching=false}.
 */
public final class StaticAssetCaching {

  /** Property that turns the policy off (it is on unless set to false). */
  public static final String ENABLED_PROPERTY = "mateu.static-assets.caching";

  /** Content-versioned paths: whatever is behind one of them never changes. */
  public static final List<String> IMMUTABLE_PATTERNS = List.of("/version_*/**");

  /**
   * The folders holding Mateu's assets with stable names, which must be revalidated. Folders, not
   * patterns: a resource handler resolves the path that follows a pattern's literal prefix, so
   * {@code /assets/**} is served from each static location's {@code assets/} sub-folder.
   */
  public static final List<String> REVALIDATE_FOLDERS =
      List.of("assets", "js", "myassets", "_redwood");

  /** How long an immutable asset is cached. */
  public static final Duration IMMUTABLE_MAX_AGE = Duration.ofDays(365);

  /** Spring Boot's default static locations, used when the app has not configured its own. */
  public static final List<String> DEFAULT_LOCATIONS =
      List.of(
          "classpath:/META-INF/resources/",
          "classpath:/resources/",
          "classpath:/static/",
          "classpath:/public/");

  /**
   * A weak ETag from a resource's size and modification time: cheap (no hashing of the bytes on
   * every request), and weak so that a compressing server or proxy in front does not make it wrong.
   */
  public static String weakEtag(long contentLength, long lastModified) {
    if (contentLength < 0 || lastModified <= 0) {
      return null;
    }
    return "W/\"" + Long.toHexString(contentLength) + "-" + Long.toHexString(lastModified) + "\"";
  }

  /** The {@code Cache-Control} of an immutable (content-versioned) asset. */
  public static final String IMMUTABLE_CACHE_CONTROL =
      "max-age=" + IMMUTABLE_MAX_AGE.toSeconds() + ", public, immutable";

  /** The {@code Cache-Control} of an asset with a stable name: keep it, but always revalidate. */
  public static final String REVALIDATE_CACHE_CONTROL = "no-cache";

  /**
   * The policy for a request path, for adapters whose static handler cannot be configured per
   * pattern (Micronaut, Quarkus, Helidon set the header with a response filter): {@link
   * #IMMUTABLE_CACHE_CONTROL} for {@code /version_<n>/…}, {@link #REVALIDATE_CACHE_CONTROL} for the
   * {@link #REVALIDATE_FOLDERS}, null for anything else (not a Mateu asset — left alone).
   */
  public static String cacheControlFor(String path) {
    if (path == null || !path.startsWith("/")) {
      return null;
    }
    if (path.startsWith("/version_") && path.indexOf('/', 1) > 0) {
      return IMMUTABLE_CACHE_CONTROL;
    }
    for (String folder : REVALIDATE_FOLDERS) {
      if (path.startsWith("/" + folder + "/")) {
        return REVALIDATE_CACHE_CONTROL;
      }
    }
    return null;
  }

  private StaticAssetCaching() {}
}
