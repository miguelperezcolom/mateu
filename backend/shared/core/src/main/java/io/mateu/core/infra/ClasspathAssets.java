package io.mateu.core.infra;

import java.io.IOException;
import java.io.InputStream;
import java.net.JarURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Mateu's renderer assets read straight from the classpath folder the renderer jars ship them in
 * ({@value #ROOT}), for adapters whose static handler cannot be pointed at it (Quarkus serves only
 * {@code META-INF/resources}).
 *
 * <p>The renderer jars ({@code mateu-vaadin}, {@code mateu-redwood}) carry each asset ONCE, under
 * {@code static/}: Spring Boot serves that folder by default, Micronaut and Helidon map it in the
 * app's configuration, the .NET and Python ports and the bundle exporter read it from the jar, and
 * {@code @UI(indexHtmlPath)} defaults to {@code /static/_index.html}. Only the paths {@link
 * StaticAssetCaching} names as Mateu's ({@code /assets/…}, {@code /js/…}, {@code /myassets/…},
 * {@code /_redwood/…}, {@code /version_<n>/…}) are looked up, so an app's own {@code static/}
 * content is not published by accident.
 */
public final class ClasspathAssets {

  /** The classpath folder holding the renderer's assets. */
  public static final String ROOT = "static";

  private static final java.util.Map<String, String> TYPES =
      java.util.Map.ofEntries(
          java.util.Map.entry("js", "text/javascript"),
          java.util.Map.entry("mjs", "text/javascript"),
          java.util.Map.entry("css", "text/css"),
          java.util.Map.entry("html", "text/html"),
          java.util.Map.entry("htm", "text/html"),
          java.util.Map.entry("txt", "text/plain"),
          java.util.Map.entry("md", "text/markdown"),
          java.util.Map.entry("json", "application/json"),
          java.util.Map.entry("map", "application/json"),
          java.util.Map.entry("svg", "image/svg+xml"),
          java.util.Map.entry("png", "image/png"),
          java.util.Map.entry("jpg", "image/jpeg"),
          java.util.Map.entry("jpeg", "image/jpeg"),
          java.util.Map.entry("gif", "image/gif"),
          java.util.Map.entry("webp", "image/webp"),
          java.util.Map.entry("avif", "image/avif"),
          java.util.Map.entry("ico", "image/x-icon"),
          java.util.Map.entry("woff", "font/woff"),
          java.util.Map.entry("woff2", "font/woff2"),
          java.util.Map.entry("ttf", "font/ttf"),
          java.util.Map.entry("otf", "font/otf"),
          java.util.Map.entry("wasm", "application/wasm"));

  private static final DateTimeFormatter HTTP_DATE =
      DateTimeFormatter.RFC_1123_DATE_TIME.withZone(ZoneOffset.UTC);

  /** An asset found on the classpath, with what it takes to answer and revalidate it. */
  public record Asset(String path, URL url, long contentLength, long lastModified) {

    /** The weak ETag of {@link StaticAssetCaching#weakEtag}, or null without size/time. */
    public String etag() {
      return StaticAssetCaching.weakEtag(contentLength, lastModified);
    }

    /** The {@code Last-Modified} header value, or null when the time is unknown. */
    public String lastModifiedHeader() {
      return lastModified > 0 ? HTTP_DATE.format(Instant.ofEpochMilli(lastModified)) : null;
    }

    /**
     * Whether the browser's copy is still good: its {@code If-None-Match} names this asset's ETag,
     * or (with no {@code If-None-Match}) its {@code If-Modified-Since} is not older than the asset.
     */
    public boolean notModified(String ifNoneMatch, String ifModifiedSince) {
      String etag = etag();
      if (ifNoneMatch != null) {
        if (etag == null) {
          return false;
        }
        for (String candidate : ifNoneMatch.split(",")) {
          String c = candidate.trim();
          if (c.equals("*") || c.equals(etag) || ("W/" + c).equals(etag)) {
            return true;
          }
        }
        return false;
      }
      if (ifModifiedSince != null && lastModified > 0) {
        try {
          long since = Instant.from(HTTP_DATE.parse(ifModifiedSince.trim())).toEpochMilli();
          // HTTP dates have a resolution of one second
          return lastModified / 1000 <= since / 1000;
        } catch (DateTimeParseException e) {
          return false;
        }
      }
      return false;
    }

    /**
     * The {@code Content-Type} by extension (charset on the text ones), or null when unknown. A
     * module script needs a JavaScript type or the browser refuses to run it.
     */
    public String contentType() {
      int dot = path.lastIndexOf('.');
      String type =
          dot < 0 ? null : TYPES.get(path.substring(dot + 1).toLowerCase(java.util.Locale.ROOT));
      if (type == null) {
        return URLConnection.guessContentTypeFromName(path);
      }
      return type.startsWith("text/") || type.endsWith("json") || type.endsWith("+xml")
          ? type + ";charset=UTF-8"
          : type;
    }

    /** The asset's bytes. */
    public byte[] read() throws IOException {
      URLConnection connection = url.openConnection();
      connection.setUseCaches(false);
      try (InputStream in = connection.getInputStream()) {
        return in.readAllBytes();
      }
    }
  }

  /**
   * Whether a request path is one of Mateu's asset paths (so it is looked up under {@value #ROOT}):
   * the paths {@link StaticAssetCaching#cacheControlFor} gives a policy to.
   */
  public static boolean isAssetPath(String path) {
    return StaticAssetCaching.cacheControlFor(path) != null;
  }

  /**
   * The asset behind a (decoded, normalized) request path, or null when the path is not one of
   * Mateu's, tries to leave the folder, names a directory, or nothing is there.
   */
  public static Asset find(ClassLoader classLoader, String path) {
    if (classLoader == null || !isAssetPath(path) || !safe(path)) {
      return null;
    }
    URL url = classLoader.getResource(ROOT + path);
    if (url == null) {
      return null;
    }
    try {
      URLConnection connection = url.openConnection();
      connection.setUseCaches(false);
      if (connection instanceof JarURLConnection jar) {
        var entry = jar.getJarEntry();
        if (entry == null || entry.isDirectory()) {
          return null;
        }
        return new Asset(path, url, entry.getSize(), entry.getTime());
      }
      if ("file".equals(url.getProtocol())) {
        Path file = Path.of(url.toURI());
        if (!Files.isRegularFile(file)) {
          return null;
        }
        return new Asset(path, url, Files.size(file), Files.getLastModifiedTime(file).toMillis());
      }
      long length = connection.getContentLengthLong();
      long time = connection.getLastModified();
      try (InputStream ignored = connection.getInputStream()) {
        return new Asset(path, url, length, time);
      }
    } catch (Exception e) {
      return null;
    }
  }

  private static boolean safe(String path) {
    if (path.indexOf('\\') >= 0 || path.indexOf('\0') >= 0 || path.contains("//")) {
      return false;
    }
    for (String segment : path.split("/")) {
      if (segment.equals("..") || segment.equals(".")) {
        return false;
      }
    }
    return !path.endsWith("/");
  }

  private ClasspathAssets() {}
}
