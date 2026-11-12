package io.mateu.core.infra;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Cross-origin access to Mateu's endpoints — OFF unless the application lists the origins allowed
 * to call it, the same in every adapter.
 *
 * <p>A UI is normally served by the same origin as its API, so a browser never asks. CORS is only
 * needed when the renderer is hosted elsewhere (a Visual Builder app served by {@code vb-serve}, a
 * static bundle on a CDN, a dev server on another port). The generated controllers used to carry a
 * bare {@code @CrossOrigin} (MVC, WebFlux; Micronaut's even allowed credentials for any origin) and
 * Quarkus/Helidon none: every Mateu app was callable from any web page, and the behaviour depended
 * on the framework. Now it is one opt-in allow-list:
 *
 * <pre>
 * mateu.cors.allowed-origins=https://ui.example.com,http://localhost:9006
 * mateu.cors.allow-credentials=false   # default; the renderers send a bearer token, not cookies
 * </pre>
 *
 * <p>An entry may be {@code *} (any origin — never combined with credentials) or a pattern with
 * {@code *} wildcards ({@code https://*.example.com}). Empty / unset = no CORS headers at all.
 *
 * <p>It applies to Mateu's API only — any path under a {@code /mateu/} segment ({@code
 * <baseUrl>/mateu/v3/**}, {@code /mateu/mcp}) — never to the application's own endpoints.
 *
 * <p>Spring adapters translate it into a native {@code CorsConfiguration}; Micronaut, Quarkus and
 * Helidon apply it with a filter that calls {@link #preflightHeaders} / {@link #responseHeaders}.
 */
public final class CorsPolicy {

  public static final String ALLOWED_ORIGINS_PROPERTY = "mateu.cors.allowed-origins";
  public static final String ALLOW_CREDENTIALS_PROPERTY = "mateu.cors.allow-credentials";

  /**
   * Extra paths the allow-list covers besides Mateu's API, comma-separated patterns ({@code *} =
   * within a segment, {@code /**} = any depth): what a shell on another origin loads from this app
   * directly — the module an {@code Element} of a remote screen imports ({@code /elements/**}).
   */
  public static final String PATHS_PROPERTY = "mateu.cors.paths";

  public static final List<String> ALLOWED_METHODS = List.of("GET", "POST", "OPTIONS");
  public static final long MAX_AGE_SECONDS = 1800;

  private static final CorsPolicy DISABLED = new CorsPolicy(List.of(), false, List.of());

  private final List<String> allowedOrigins;
  private final List<String> extraPaths;
  private final List<Pattern> extraPathPatterns;
  private final List<Pattern> patterns;
  private final boolean anyOrigin;
  private final boolean allowCredentials;

  private CorsPolicy(List<String> allowedOrigins, boolean allowCredentials, List<String> paths) {
    this.allowedOrigins = List.copyOf(allowedOrigins);
    this.extraPaths = List.copyOf(paths);
    this.extraPathPatterns = paths.stream().map(CorsPolicy::toPathPattern).toList();
    this.anyOrigin = allowedOrigins.contains("*");
    // "*" with credentials is rejected by browsers and by Spring (it used to make a preflight 500).
    this.allowCredentials = allowCredentials && !anyOrigin;
    this.patterns =
        allowedOrigins.stream()
            .filter(origin -> !"*".equals(origin) && origin.contains("*"))
            .map(CorsPolicy::toPattern)
            .toList();
  }

  /**
   * Parses the property values.
   *
   * @param allowedOrigins comma-separated origins (null/blank = disabled)
   * @param allowCredentials the {@value #ALLOW_CREDENTIALS_PROPERTY} value (null = false)
   */
  public static CorsPolicy of(String allowedOrigins, String allowCredentials) {
    return of(allowedOrigins, allowCredentials, null);
  }

  /**
   * As {@link #of(String, String)}, also covering the {@value #PATHS_PROPERTY} patterns.
   *
   * @param paths comma-separated path patterns (null/blank = Mateu's API only)
   */
  public static CorsPolicy of(String allowedOrigins, String allowCredentials, String paths) {
    if (allowedOrigins == null || allowedOrigins.isBlank()) {
      return DISABLED;
    }
    var origins =
        Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .map(CorsPolicy::stripTrailingSlash)
            .distinct()
            .toList();
    return origins.isEmpty()
        ? DISABLED
        : new CorsPolicy(
            origins,
            Boolean.parseBoolean(String.valueOf(allowCredentials).trim()),
            pathPatternsOf(paths));
  }

  private static List<String> pathPatternsOf(String paths) {
    if (paths == null || paths.isBlank()) {
      return List.of();
    }
    return Arrays.stream(paths.split(","))
        .map(String::trim)
        .filter(path -> !path.isEmpty())
        .map(path -> path.startsWith("/") ? path : "/" + path)
        .distinct()
        .toList();
  }

  /** The {@value #PATHS_PROPERTY} patterns this policy covers besides Mateu's API. */
  public List<String> extraPaths() {
    return extraPaths;
  }

  /**
   * Whether this policy covers {@code path}: one of Mateu's endpoints ({@link #appliesTo}) or a
   * {@value #PATHS_PROPERTY} pattern (matched on the canonical path).
   */
  public boolean covers(String path) {
    if (appliesTo(path)) {
      return true;
    }
    if (path == null || extraPathPatterns.isEmpty()) {
      return false;
    }
    var clean = io.mateu.core.infra.security.JsonBodyGuard.canonicalPath(path);
    for (var pattern : extraPathPatterns) {
      if (pattern.matcher(clean).matches()) {
        return true;
      }
    }
    return false;
  }

  /** {@code /elements/**} = /elements and anything under it; {@code *} stays within a segment. */
  static Pattern toPathPattern(String path) {
    var regex = new StringBuilder();
    int i = 0;
    while (i < path.length()) {
      if (path.startsWith("/**", i)) {
        regex.append("(?:/.*)?");
        i += 3;
      } else if (path.charAt(i) == '*') {
        regex.append("[^/]*");
        i++;
      } else {
        int next = i;
        while (next < path.length() && path.charAt(next) != '*' && !path.startsWith("/**", next)) {
          next++;
        }
        regex.append(Pattern.quote(path.substring(i, next)));
        i = next;
      }
    }
    return Pattern.compile(regex.toString());
  }

  public static CorsPolicy disabled() {
    return DISABLED;
  }

  public boolean enabled() {
    return !allowedOrigins.isEmpty();
  }

  public List<String> allowedOrigins() {
    return allowedOrigins;
  }

  public boolean allowCredentials() {
    return allowCredentials;
  }

  /** Exact origins (no wildcard), for frameworks that distinguish them from patterns. */
  public List<String> exactOrigins() {
    return allowedOrigins.stream().filter(origin -> !origin.contains("*")).toList();
  }

  /** Origins carrying a {@code *} wildcard (including {@code *} itself). */
  public List<String> originPatterns() {
    return allowedOrigins.stream().filter(origin -> origin.contains("*")).toList();
  }

  /** Whether {@code path} is one of Mateu's endpoints — the only paths this policy covers. */
  public static boolean appliesTo(String path) {
    if (path == null) {
      return false;
    }
    return path.equals("/mateu") || path.startsWith("/mateu/") || path.contains("/mateu/");
  }

  /** Whether a request from {@code origin} is allowed. */
  public boolean allows(String origin) {
    if (!enabled() || origin == null || origin.isBlank()) {
      return false;
    }
    if (anyOrigin) {
      return true;
    }
    var normalized = stripTrailingSlash(origin.trim());
    for (var allowed : allowedOrigins) {
      if (allowed.equalsIgnoreCase(normalized)) {
        return true;
      }
    }
    for (var pattern : patterns) {
      if (pattern.matcher(normalized).matches()) {
        return true;
      }
    }
    return false;
  }

  /** Whether a request is a CORS preflight. */
  public static boolean isPreflight(String method, String origin, String requestMethodHeader) {
    return "OPTIONS".equalsIgnoreCase(method)
        && origin != null
        && requestMethodHeader != null
        && !requestMethodHeader.isBlank();
  }

  /**
   * The headers of the answer to a preflight, or null when it must be refused (origin not allowed
   * or method not allowed) — refuse with 403.
   */
  public Map<String, String> preflightHeaders(
      String origin, String requestMethod, String requestHeaders) {
    if (!allows(origin)
        || requestMethod == null
        || !ALLOWED_METHODS.contains(requestMethod.trim().toUpperCase(Locale.ROOT))) {
      return null;
    }
    var headers = baseHeaders(origin);
    headers.put("Access-Control-Allow-Methods", String.join(", ", ALLOWED_METHODS));
    if (requestHeaders != null && !requestHeaders.isBlank()) {
      headers.put("Access-Control-Allow-Headers", requestHeaders);
    }
    headers.put("Access-Control-Max-Age", String.valueOf(MAX_AGE_SECONDS));
    return headers;
  }

  /** The headers to add to an actual (non-preflight) response; empty when not allowed. */
  public Map<String, String> responseHeaders(String origin) {
    if (!allows(origin)) {
      return Map.of();
    }
    return baseHeaders(origin);
  }

  private Map<String, String> baseHeaders(String origin) {
    var headers = new LinkedHashMap<String, String>();
    headers.put("Access-Control-Allow-Origin", anyOrigin ? "*" : origin);
    if (!anyOrigin) {
      headers.put("Vary", "Origin");
    }
    if (allowCredentials) {
      headers.put("Access-Control-Allow-Credentials", "true");
    }
    // a cross-origin renderer reads the build id to notice a redeployment
    headers.put("Access-Control-Expose-Headers", io.mateu.core.infra.versioning.AppBuild.HEADER);
    return headers;
  }

  private static String stripTrailingSlash(String origin) {
    return origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin;
  }

  private static Pattern toPattern(String origin) {
    var regex = new StringBuilder();
    for (String part : origin.split("\\*", -1)) {
      if (!regex.isEmpty()) {
        regex.append("[^/]*");
      }
      regex.append(Pattern.quote(part));
    }
    return Pattern.compile(regex.toString(), Pattern.CASE_INSENSITIVE);
  }
}
