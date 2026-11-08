package io.mateu.core.infra;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.zip.Deflater;
import java.util.zip.GZIPOutputStream;

/**
 * Gzip for Mateu's own static assets — the single source for every adapter that serves them.
 *
 * <p>Measured before it existed (2026-11, {@code design/performance/baseline-2026-11.md}): every
 * adapter served the renderer bundles UNCOMPRESSED, so the Vaadin renderer's first load moved 2.6
 * MB of JavaScript instead of 0.65 MB — on a slow phone network (Fast 3G) that alone was ~10 s of
 * the ~14 s before the first screen. Spring Boot and Quarkus only compress when the APP turns
 * response compression on, and few do; the assets are Mateu's, so Mateu compresses them.
 *
 * <p>Compressed once per asset and process ({@link Deflater#BEST_COMPRESSION}: the cost is paid on
 * the first request only) and kept in memory, keyed by the asset's location, size and modification
 * time — a redeployed asset is a new key. The cache is bounded ({@link #MAX_CACHED_BYTES}); past it
 * an asset is compressed per request rather than kept. Only text formats ({@link #COMPRESSIBLE}) of
 * at least {@link #MIN_BYTES} are compressed: images and fonts already are, and a tiny file gains
 * nothing.
 *
 * <p>The gzip variant gets its own validator ({@link #gzipEtag}): a cache that stored the gzip
 * bytes must not revalidate them as the identity ones. Every compressible asset response carries
 * {@code Vary: Accept-Encoding}. Off with {@code mateu.static-assets.compression=false}.
 */
public final class AssetCompression {

  /** Property that turns compression off (it is on unless set to false). */
  public static final String ENABLED_PROPERTY = "mateu.static-assets.compression";

  /** Smaller assets are served as they are. */
  public static final int MIN_BYTES = 1024;

  /** Upper bound of the compressed bytes kept in memory (the Vaadin + Redwood bundles: ~3 MB). */
  public static final long MAX_CACHED_BYTES = 64L * 1024 * 1024;

  /** Extensions worth compressing: text. */
  public static final Set<String> COMPRESSIBLE =
      Set.of("js", "mjs", "css", "html", "htm", "json", "map", "svg", "txt", "md", "xml", "wasm");

  private static final Map<String, byte[]> CACHE = new ConcurrentHashMap<>();
  private static final AtomicLong CACHED = new AtomicLong();

  /**
   * Whether compression is on: unless {@value #ENABLED_PROPERTY} is {@code false} (read through
   * {@link MateuSettings}, so the framework's configuration file counts).
   */
  public static boolean enabled() {
    return !"false".equalsIgnoreCase(MateuSettings.get(ENABLED_PROPERTY));
  }

  /** Whether the path names a text format worth compressing. */
  public static boolean compressible(String path) {
    if (path == null) {
      return false;
    }
    int query = path.indexOf('?');
    String p = query >= 0 ? path.substring(0, query) : path;
    int dot = p.lastIndexOf('.');
    int slash = p.lastIndexOf('/');
    return dot > slash && COMPRESSIBLE.contains(p.substring(dot + 1).toLowerCase(Locale.ROOT));
  }

  /**
   * Whether the request's {@code Accept-Encoding} accepts gzip: named (or {@code *}) without {@code
   * q=0}.
   */
  public static boolean acceptsGzip(String acceptEncoding) {
    if (acceptEncoding == null || acceptEncoding.isBlank()) {
      return false;
    }
    Boolean star = null;
    for (String part : acceptEncoding.split(",")) {
      String[] pieces = part.trim().split(";");
      String coding = pieces[0].trim().toLowerCase(Locale.ROOT);
      boolean refused = false;
      for (int i = 1; i < pieces.length; i++) {
        String param = pieces[i].trim().toLowerCase(Locale.ROOT).replace(" ", "");
        if (param.startsWith("q=")) {
          try {
            refused = Double.parseDouble(param.substring(2)) <= 0;
          } catch (NumberFormatException e) {
            refused = true;
          }
        }
      }
      if (coding.equals("gzip") || coding.equals("x-gzip")) {
        return !refused;
      }
      if (coding.equals("*")) {
        star = !refused;
      }
    }
    return Boolean.TRUE.equals(star);
  }

  /**
   * Whether this response should be the gzip variant: compression on, a compressible path, a body
   * large enough and a client that accepts it.
   */
  public static boolean shouldGzip(
      boolean enabled, String path, long contentLength, String acceptEncoding) {
    return enabled
        && contentLength >= MIN_BYTES
        && compressible(path)
        && acceptsGzip(acceptEncoding);
  }

  /** A source of an asset's identity bytes. */
  @FunctionalInterface
  public interface Bytes {
    byte[] read() throws IOException;
  }

  /**
   * The gzip bytes of an asset, from the cache when its {@code location}, size and modification
   * time were compressed before.
   */
  public static byte[] gzipped(String location, long contentLength, long lastModified, Bytes raw) {
    String key = location + '|' + contentLength + '|' + lastModified;
    byte[] cached = CACHE.get(key);
    if (cached != null) {
      return cached;
    }
    byte[] gz;
    try {
      gz = gzip(raw.read());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    if (CACHED.addAndGet(gz.length) <= MAX_CACHED_BYTES) {
      byte[] previous = CACHE.putIfAbsent(key, gz);
      if (previous != null) {
        CACHED.addAndGet(-gz.length);
        return previous;
      }
    } else {
      CACHED.addAndGet(-gz.length);
    }
    return gz;
  }

  /** Gzip at the best compression level. */
  public static byte[] gzip(byte[] raw) {
    var out = new ByteArrayOutputStream(Math.max(64, raw.length / 3));
    try (var gz =
        new GZIPOutputStream(out, 8192) {
          {
            def.setLevel(Deflater.BEST_COMPRESSION);
          }
        }) {
      gz.write(raw);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    return out.toByteArray();
  }

  /**
   * The validator of the gzip variant: the identity ETag with {@code -gzip} inside the quotes
   * ({@code W/"a-b"} → {@code W/"a-b-gzip"}), or null for null.
   */
  public static String gzipEtag(String etag) {
    if (etag == null || !etag.endsWith("\"")) {
      return etag;
    }
    return etag.substring(0, etag.length() - 1) + "-gzip\"";
  }

  /** Forgets every compressed asset (tests). */
  static void clear() {
    CACHE.clear();
    CACHED.set(0);
  }

  private AssetCompression() {}
}
