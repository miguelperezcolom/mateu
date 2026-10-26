package io.mateu.core.infra;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.mateu.core.infra.versioning.AppBuild;
import io.mateu.core.infra.versioning.MateuVersion;
import io.mateu.uidl.fluent.AppShell;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Every Mateu UI as an installable Progressive Web App: Chrome and Edge offer "Install app" on the
 * desktop (its own window and icon), phones add it to the home screen, and the shell opens offline.
 * The single implementation behind every adapter (MVC, WebFlux, Micronaut, Quarkus, Helidon MP),
 * the YAML mounts and the static bundle writer; the .NET and Python ports serve the same files.
 *
 * <p>Three parts, all under {@code <baseUrl>}{@value #DIR} on a served app:
 *
 * <ul>
 *   <li>{@value #MANIFEST} — the W3C web app manifest. Its members come from the SAME derivation as
 *       the Mateu mobile app's manifest ({@link MobileManifest#build}: settings &gt;
 *       {@code @MobileApp} &gt; the app shell), so a rename reaches both; icons fall back to
 *       Mateu's own ({@value #ICON_192}, {@value #ICON_512}, {@value #ICON_MASKABLE}).
 *   <li>{@value #WORKER} — the service worker: network first, so it never hides a new deploy; it
 *       caches only the shell and static files and never the API or REST-source data (see the file
 *       itself). One cache per build. Served with {@code Service-Worker-Allowed}, so it controls
 *       the whole UI although it lives under {@code /mateu/}.
 *   <li>{@value #REGISTER} — the external script that registers it (the page has no inline script,
 *       so a {@code script-src 'self'} policy needs nothing more).
 * </ul>
 *
 * <p>ON by default. {@value #ENABLED}{@code =false} (system property, framework configuration or
 * {@code MATEU_PWA_ENABLED}) turns it off; it is also off in development mode, where a cached shell
 * would only get in the way of live reload. Off, the page carries none of it and the worker's URL
 * answers a worker that unregisters itself, so a browser that installed it before lets it go.
 */
public final class Pwa {

  /** The setting that turns it off ({@code false}). */
  public static final String ENABLED = "mateu.pwa.enabled";

  /** Where the files live, under a UI's base URL. */
  public static final String DIR = "/mateu/v3/pwa/";

  public static final String MANIFEST = "manifest.webmanifest";
  public static final String WORKER = "sw.js";
  public static final String REGISTER = "register.js";
  public static final String ICON_192 = "icon-192.png";
  public static final String ICON_512 = "icon-512.png";
  public static final String ICON_MASKABLE = "icon-maskable-512.png";

  /** The worker that removes itself, answered at the worker's URL when this is switched off. */
  public static final String WORKER_OFF = "sw-off.js";

  /** The splash-screen background of an installed app. */
  public static final String BACKGROUND_COLOR = "#ffffff";

  private static final String RESOURCES = "/io/mateu/core/infra/pwa/";

  private static final Pattern HEX_COLOR =
      Pattern.compile("#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})");

  private Pwa() {}

  /** Whether the UIs are served as PWAs: unless {@value #ENABLED} is false, and not in dev mode. */
  public static boolean enabled() {
    return !"false".equalsIgnoreCase(MateuSettings.get(ENABLED))
        && !io.mateu.core.infra.dev.DevMode.enabled();
  }

  /** Whether {@code path} is one of the files under {@value #DIR}. */
  public static boolean isEndpoint(String path) {
    return path != null && path.contains(DIR);
  }

  /**
   * The scope of a UI at {@code baseUrl}: {@code /} for the root UI, {@code /crm} otherwise (no
   * trailing slash: the UI's own page is {@code /crm}, and it must be inside).
   */
  public static String scopeOf(String baseUrl) {
    var p = baseUrl == null ? "" : baseUrl.trim();
    while (p.startsWith("/")) {
      p = p.substring(1);
    }
    while (p.endsWith("/")) {
      p = p.substring(0, p.length() - 1);
    }
    return "/" + p;
  }

  /** The folder of the files of a served UI: {@code /mateu/v3/pwa/}, {@code /crm/mateu/v3/pwa/}. */
  public static String dirOf(String baseUrl) {
    var scope = scopeOf(baseUrl);
    return (scope.equals("/") ? "" : scope) + DIR;
  }

  // ------------------------------------------------------------------------------------------
  // The web app manifest
  // ------------------------------------------------------------------------------------------

  /**
   * The web app manifest's members, in order.
   *
   * @param source what the UI declares (as for the mobile app's manifest)
   * @param startUrl the page the installed app opens (also its {@code id})
   * @param scope the URLs the installed app owns
   */
  public static Map<String, Object> manifest(
      MobileManifest.Source source, String startUrl, String scope) {
    var derived =
        MobileManifest.build(source == null ? MobileManifest.sourceOf((AppShell) null) : source);
    var manifest = new LinkedHashMap<String, Object>();
    manifest.put("id", startUrl);
    manifest.put("name", derived.get("name"));
    manifest.put("short_name", derived.get("shortName"));
    manifest.put("start_url", startUrl);
    manifest.put("scope", scope);
    manifest.put("display", "standalone");
    manifest.put("background_color", BACKGROUND_COLOR);
    var theme = themeColor(source);
    if (theme != null) {
      manifest.put("theme_color", theme);
    }
    manifest.put("icons", icons(source));
    return manifest;
  }

  /** {@link #manifest} as JSON. */
  public static String manifestJson(MobileManifest.Source source, String startUrl, String scope) {
    try {
      return WireMapper.shared().writeValueAsString(manifest(source, startUrl, scope));
    } catch (JsonProcessingException e) {
      throw new IllegalStateException(e);
    }
  }

  /** The theme colour the UI declares (the mobile manifest's), when it is a hex colour. */
  public static String themeColor(MobileManifest.Source source) {
    if (source == null) {
      return null;
    }
    var value = MobileManifest.build(source).get("themeColor");
    return value instanceof String s && HEX_COLOR.matcher(s).matches() ? s : null;
  }

  /**
   * The icon the UI declares for itself — the mobile manifest's, from {@code mateu.mobile.icon},
   * {@code @MobileApp(icon)} or the shell's logo, but never the favicon (a 16–32 px image would
   * make a blurred app icon) — normalised to a URL a manifest may carry, or null. Accepted: an
   * https URL, a path on the UI's origin (a relative one is taken from the origin's root), a raster
   * or SVG {@code data:image/…} URI. Refused: plain http, other schemes, {@code .ico}.
   */
  public static String declaredIcon(MobileManifest.Source source) {
    if (source == null) {
      return null;
    }
    var withoutFavicon =
        new MobileManifest.Source(
            source.title(), source.logo(), null, source.accentColor(), source.mobileApp());
    var value = MobileManifest.build(withoutFavicon).get("icon");
    if (!(value instanceof String icon) || icon.isBlank()) {
      return null;
    }
    icon = icon.trim();
    var lower = icon.toLowerCase(Locale.ROOT);
    if (lower.startsWith("data:")) {
      return iconType(icon) != null ? icon : null;
    }
    if (lower.contains("<") || lower.contains("\"") || lower.contains(" ")) {
      return null;
    }
    if (pathOf(lower).endsWith(".ico")) {
      return null;
    }
    if (lower.startsWith("https://")) {
      return icon;
    }
    if (lower.startsWith("//") || lower.matches("^[a-z][a-z0-9+.-]*:.*")) {
      return null; // protocol-relative, http:, javascript:…
    }
    return icon.startsWith("/") ? icon : "/" + icon;
  }

  private static String pathOf(String url) {
    var cut = url.length();
    for (char c : new char[] {'?', '#'}) {
      var at = url.indexOf(c);
      if (at >= 0 && at < cut) {
        cut = at;
      }
    }
    return url.substring(0, cut);
  }

  /** The MIME type of an icon URL, when it is one a browser shows as an app icon, else null. */
  static String iconType(String icon) {
    var lower = icon.toLowerCase(Locale.ROOT);
    if (lower.startsWith("data:")) {
      for (var type :
          List.of("image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml")) {
        if (lower.startsWith("data:" + type + ";") || lower.startsWith("data:" + type + ",")) {
          return type;
        }
      }
      return null;
    }
    var path = pathOf(lower);
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".svg")) return "image/svg+xml";
    if (path.endsWith(".webp")) return "image/webp";
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
    if (path.endsWith(".gif")) return "image/gif";
    return "";
  }

  /**
   * The manifest's icons: the declared one first (any size — its real size is unknown, so the
   * browser scales it), then Mateu's defaults, which a browser falls back to and which guarantee
   * the 192 and 512 px icons installability asks for. Their {@code src} is relative to the
   * manifest.
   */
  static List<Map<String, Object>> icons(MobileManifest.Source source) {
    var icons = new ArrayList<Map<String, Object>>();
    var declared = declaredIcon(source);
    if (declared != null) {
      var icon = new LinkedHashMap<String, Object>();
      icon.put("src", declared);
      icon.put("sizes", "any");
      var type = iconType(declared);
      if (type != null && !type.isEmpty()) {
        icon.put("type", type);
      }
      icon.put("purpose", "any");
      icons.add(icon);
    }
    icons.add(icon(ICON_192, "192x192", "any"));
    icons.add(icon(ICON_512, "512x512", "any"));
    icons.add(icon(ICON_MASKABLE, "512x512", "maskable"));
    return icons;
  }

  private static Map<String, Object> icon(String src, String sizes, String purpose) {
    var icon = new LinkedHashMap<String, Object>();
    icon.put("src", src);
    icon.put("sizes", sizes);
    icon.put("type", "image/png");
    icon.put("purpose", purpose);
    return icon;
  }

  // ------------------------------------------------------------------------------------------
  // The page's head
  // ------------------------------------------------------------------------------------------

  /**
   * Where a page finds the PWA's files.
   *
   * @param manifest the web app manifest's URL
   * @param worker the service worker's URL (without query)
   * @param register the registration script's URL
   * @param appleTouchIcon the icon iOS puts on the home screen
   * @param scope the worker's scope
   * @param precache files the worker caches when installed besides the shell (a bundle's {@code
   *     manifest.json}), may be empty
   */
  public record Links(
      String manifest,
      String worker,
      String register,
      String appleTouchIcon,
      String scope,
      List<String> precache) {

    public Links {
      precache = precache == null ? List.of() : List.copyOf(precache);
    }

    /** The links of a UI served at {@code baseUrl}. */
    public static Links served(String baseUrl) {
      var dir = dirOf(baseUrl);
      return new Links(
          dir + MANIFEST,
          dir + WORKER,
          dir + REGISTER,
          dir + ICON_192,
          scopeOf(baseUrl),
          List.of());
    }
  }

  /**
   * A served page with the PWA's head: {@code html} unchanged when it is switched off ({@link
   * #enabled()}).
   *
   * @param source what the UI declares (theme colour, icon); null when unknown
   */
  public static String served(String html, String baseUrl, MobileManifest.Source source) {
    if (!enabled() || html == null) {
      return html;
    }
    return withHead(html, Links.served(baseUrl), source, AppBuild.id());
  }

  /**
   * {@code html} with the manifest link, the theme colour, the apple-touch-icon and the worker's
   * registration added to its {@code <head>}. The worker's URL carries its version — a hash of the
   * page and of {@code buildId}, so the next build installs a new worker that drops this one's
   * cache — and the folders the page loads its own files from, which it may cache. A page that
   * already has a manifest link is left as it is.
   */
  public static String withHead(
      String html, Links links, MobileManifest.Source source, String buildId) {
    if (html == null || !html.contains("</head>") || html.contains("rel=\"manifest\"")) {
      return html;
    }
    var query = new StringBuilder("?v=").append(version(html, buildId));
    for (var folder : staticFolders(html)) {
      query.append("&s=").append(URLEncoder.encode(folder, StandardCharsets.UTF_8));
    }
    for (var file : links.precache()) {
      query.append("&p=").append(URLEncoder.encode(file, StandardCharsets.UTF_8));
    }
    var head = new StringBuilder();
    head.append("<link rel=\"manifest\" href=\"")
        .append(attr(links.manifest()))
        .append("\" crossorigin=\"use-credentials\">");
    var theme = themeColor(source);
    if (theme != null) {
      head.append("<meta name=\"theme-color\" content=\"").append(attr(theme)).append("\">");
    }
    var declared = declaredIcon(source);
    var touchIcon =
        declared != null
                && !declared.startsWith("data:")
                && !"image/svg+xml".equals(iconType(declared))
            ? declared
            : links.appleTouchIcon();
    head.append("<link rel=\"apple-touch-icon\" href=\"").append(attr(touchIcon)).append("\">");
    head.append("<script src=\"")
        .append(attr(links.register()))
        .append("\" data-sw=\"")
        .append(attr(links.worker() + query))
        .append("\" data-scope=\"")
        .append(attr(links.scope()))
        .append("\" defer></script>");
    var at = html.indexOf("</head>");
    return html.substring(0, at) + head + html.substring(at);
  }

  /** A short hash of the page and the build: the worker's version. */
  static String version(String html, String buildId) {
    try {
      var digest = MessageDigest.getInstance("SHA-256");
      digest.update(html.getBytes(StandardCharsets.UTF_8));
      digest.update(
          ("\n" + buildId + "\n" + MateuVersion.current()).getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest.digest()).substring(0, 16);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  private static final Pattern SCRIPT_SRC =
      Pattern.compile(
          "<script\\b[^>]*?\\s(?:data-)?src\\s*=\\s*[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);
  private static final Pattern LINK = Pattern.compile("<link\\b[^>]*>", Pattern.CASE_INSENSITIVE);
  private static final Pattern LINK_REL =
      Pattern.compile(
          "\\srel\\s*=\\s*[\"'][^\"']*\\b(stylesheet|modulepreload|preload)\\b",
          Pattern.CASE_INSENSITIVE);
  private static final Pattern LINK_HREF =
      Pattern.compile("\\shref\\s*=\\s*[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);

  /**
   * The folders a page loads its scripts and stylesheets from — {@code /assets/}, {@code
   * /_redwood/}, {@code https://static.oracle.com/cdn/} — which the worker may cache whatever their
   * request (a Visual Builder app reads its JSON with XHR). Never a {@code /mateu/} folder, and
   * only what scripts and stylesheets name, so no data endpoint can slip in.
   */
  static List<String> staticFolders(String html) {
    var urls = new ArrayList<String>();
    Matcher m = SCRIPT_SRC.matcher(html);
    while (m.find()) {
      urls.add(m.group(1));
    }
    m = LINK.matcher(html);
    while (m.find()) {
      var tag = m.group();
      if (LINK_REL.matcher(tag).find()) {
        var href = LINK_HREF.matcher(tag);
        if (href.find()) {
          urls.add(href.group(1));
        }
      }
    }
    var folders = new LinkedHashSet<String>();
    for (var url : urls) {
      var folder = folderOf(url.trim());
      if (folder != null) {
        folders.add(folder);
      }
      if (folders.size() >= 8) {
        break;
      }
    }
    return List.copyOf(folders);
  }

  private static String folderOf(String url) {
    var lower = url.toLowerCase(Locale.ROOT);
    String origin = "";
    String path;
    if (lower.startsWith("https://") || lower.startsWith("http://") || lower.startsWith("//")) {
      var from = lower.startsWith("//") ? 2 : url.indexOf("//") + 2;
      var slash = url.indexOf('/', from);
      if (slash < 0) {
        return null;
      }
      origin = (lower.startsWith("//") ? "https:" : "") + url.substring(0, slash);
      path = url.substring(slash);
    } else if (lower.matches("^[a-z][a-z0-9+.-]*:.*") || lower.startsWith("#")) {
      return null; // data:, blob:, javascript:…
    } else {
      path = url.startsWith("/") ? url : "/" + (url.startsWith("./") ? url.substring(2) : url);
    }
    path = pathOf(path);
    var second = path.indexOf('/', 1);
    if (second < 0) {
      return null; // a file at the root is no folder
    }
    var segment = path.substring(1, second);
    if (segment.isEmpty()
        || segment.equals("mateu")
        || segment.equals("..")
        || segment.equals(".")) {
      return null;
    }
    return origin + "/" + segment + "/";
  }

  // ------------------------------------------------------------------------------------------
  // The files
  // ------------------------------------------------------------------------------------------

  /** A file of the PWA, ready to be written to the response. */
  public record Asset(String contentType, Map<String, String> headers, byte[] body) {}

  /** A PWA file of the UI declared by class {@code uiId}, served at {@code baseUrl}; null: none. */
  public static Asset asset(String file, String uiId, String baseUrl) {
    return asset(file, baseUrl, () -> MobileManifest.sourceOf(uiId));
  }

  /** A PWA file of a UI whose app shell is {@code shell} (YAML mounts); null: no such file. */
  public static Asset asset(String file, AppShell shell, String baseUrl) {
    return asset(file, baseUrl, () -> MobileManifest.sourceOf(shell));
  }

  /**
   * A PWA file of the UI at {@code baseUrl}, or null when {@code file} is not one of them (a 404).
   * Switched off ({@link #enabled()}), the manifest and the registration script are 404 too, and
   * the worker is the one that unregisters itself.
   */
  public static Asset asset(String file, String baseUrl, Supplier<MobileManifest.Source> source) {
    if (file == null) {
      return null;
    }
    var on = enabled();
    var scope = scopeOf(baseUrl);
    return switch (file) {
      case MANIFEST ->
          on
              ? new Asset(
                  "application/manifest+json",
                  headers("application/manifest+json", "public, max-age=300", null),
                  manifestJson(source.get(), scope, scope).getBytes(StandardCharsets.UTF_8))
              : null;
      case WORKER ->
          new Asset(
              "text/javascript; charset=utf-8",
              headers("text/javascript; charset=utf-8", "no-cache", scope),
              resource(on ? WORKER : WORKER_OFF));
      case REGISTER ->
          on
              ? new Asset(
                  "text/javascript; charset=utf-8",
                  headers("text/javascript; charset=utf-8", "no-cache", null),
                  resource(REGISTER))
              : null;
      case ICON_192, ICON_512, ICON_MASKABLE ->
          new Asset(
              "image/png", headers("image/png", "public, max-age=86400", null), resource(file));
      default -> null;
    };
  }

  private static Map<String, String> headers(
      String contentType, String cacheControl, String workerScope) {
    var headers = new LinkedHashMap<String, String>();
    headers.put("Content-Type", contentType);
    headers.put("Cache-Control", cacheControl);
    headers.put("X-Content-Type-Options", "nosniff");
    if (workerScope != null) {
      // the worker lives under /mateu/v3/pwa/ but controls the whole UI
      headers.put("Service-Worker-Allowed", workerScope);
    }
    return Map.copyOf(headers);
  }

  /** The bytes of one of the files shipped in this jar ({@value #WORKER}, the icons…). */
  public static byte[] resource(String name) {
    try (InputStream in = Pwa.class.getResourceAsStream(RESOURCES + name)) {
      if (in == null) {
        throw new IllegalStateException("missing PWA resource " + name);
      }
      return in.readAllBytes();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static String attr(String value) {
    return value == null
        ? ""
        : value.replace("&", "&amp;").replace("\"", "&quot;").replace("<", "&lt;");
  }
}
