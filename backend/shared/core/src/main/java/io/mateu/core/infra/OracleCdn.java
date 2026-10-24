package io.mateu.core.infra;

import java.net.URI;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;

/**
 * Points the Redwood renderer at a mirror of Oracle's CDN ({@value #DEFAULT}) that the deploying
 * organisation hosts — for networks that cannot reach {@code static.oracle.com}, or that want the
 * runtime served from their own infrastructure.
 *
 * <p>Mateu never bundles those files: JET is UPL, but the Spectra components, the Visual Builder
 * runtime and the gallery have no public redistribution licence (see the renderer's NOTICE.md). The
 * organisation mirrors them under its own agreement with Oracle; Mateu only rewrites, in the page
 * it serves, every {@value #DEFAULT} url to the mirror — the theme, the scripts, the runtime's own
 * configuration ({@code JET_CDN_PATH}) and the module paths. The renderer derives everything else
 * it loads from that configuration (the module paths Visual Builder applies later, the gallery
 * images).
 *
 * <pre>
 * mateu.oracle-cdn.url=https://cdn.example.com/oracle/cdn   # a mirror of https://static.oracle.com/cdn
 * </pre>
 *
 * Unset = the page is served untouched (Oracle's CDN).
 */
@Slf4j
public final class OracleCdn {

  /**
   * The setting naming the mirror ({@code -Dmateu.oracle-cdn.url}, {@code MATEU_ORACLE_CDN_URL}).
   */
  public static final String SETTING = "mateu.oracle-cdn.url";

  /** Oracle's CDN, as the renderer's page references it. */
  public static final String DEFAULT = "https://static.oracle.com/cdn";

  private static final String DEFAULT_ORIGIN = "https://static.oracle.com";

  private static final Pattern UNSAFE = Pattern.compile("[\\s\"'<>`\\\\]");

  private static final AtomicBoolean WARNED = new AtomicBoolean();

  private OracleCdn() {}

  /** The page with Oracle's CDN pointed at the configured mirror; unchanged when none is set. */
  public static String apply(String html) {
    return apply(html, MateuSettings.get(SETTING));
  }

  /**
   * The page with Oracle's CDN pointed at {@code mirror}; unchanged when it is blank or invalid.
   */
  public static String apply(String html, String mirror) {
    var base = validBase(mirror);
    if (html == null || base == null || !html.contains(DEFAULT_ORIGIN)) {
      return html;
    }
    // the preconnect names the bare origin; everything else is under /cdn
    return html.replace(DEFAULT, base)
        .replace("href=\"" + DEFAULT_ORIGIN + "\"", "href=\"" + origin(base) + "\"");
  }

  /**
   * The mirror's base url without a trailing slash, or null when it is blank or not a plain
   * absolute http(s) url (warned about once: a wrong value must not break the page).
   */
  static String validBase(String mirror) {
    if (mirror == null || mirror.isBlank()) {
      return null;
    }
    var value = mirror.trim();
    while (value.endsWith("/")) {
      value = value.substring(0, value.length() - 1);
    }
    try {
      var uri = URI.create(value);
      var scheme = uri.getScheme();
      if (!UNSAFE.matcher(value).find()
          && uri.getHost() != null
          && ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))) {
        return value;
      }
    } catch (IllegalArgumentException e) {
      // reported below
    }
    if (WARNED.compareAndSet(false, true)) {
      log.warn(
          "Ignoring {}: '{}' is not an absolute http(s) url; the renderer keeps loading from {}",
          SETTING,
          value.replaceAll("[\\r\\n]", " "),
          DEFAULT);
    }
    return null;
  }

  private static String origin(String base) {
    var uri = URI.create(base);
    return uri.getScheme() + "://" + uri.getRawAuthority();
  }
}
