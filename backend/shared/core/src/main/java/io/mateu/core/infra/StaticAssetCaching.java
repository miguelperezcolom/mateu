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
 *   <li><b>Immutable</b> — Redwood's {@code /version_<n>/…}: the build stamps a new number into the
 *       path whenever the bundle changes, so the bytes behind a given path never change. Cached for
 *       a year and never revalidated.
 *   <li><b>Revalidate</b> — the assets whose names are fixed across releases (the Vaadin renderer's
 *       {@code /assets/mateu-vaadin.js} and its chunks, keycloak.min.js, …): {@code no-cache}, so
 *       the browser keeps them and asks, and an unchanged file costs a 304 with no body (ETag and
 *       Last-Modified are both sent).
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
  public static final List<String> REVALIDATE_FOLDERS = List.of("assets", "js", "myassets");

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

  private StaticAssetCaching() {}
}
