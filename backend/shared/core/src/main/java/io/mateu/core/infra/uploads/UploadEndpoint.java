package io.mateu.core.infra.uploads;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.application.runaction.ErrorBoundary;
import io.mateu.core.infra.MateuSettings;
import io.mateu.uidl.data.IncomingFile;
import io.mateu.uidl.data.StoredFile;
import io.mateu.uidl.data.UploadRequest;
import io.mateu.uidl.interfaces.FileStorage;
import io.mateu.uidl.interfaces.HttpRequest;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Locale;
import java.util.function.Supplier;

/**
 * {@code POST /mateu/v3/upload} and {@code POST /mateu/v3/upload/target}: the single body of the
 * upload endpoint for every adapter (MVC, WebFlux, Micronaut, Quarkus, Helidon MP), which only map
 * the two ROOT paths, hand over the headers and the raw body stream on a thread that may block, and
 * write back {@link Answer#status()} and {@link Answer#body()} as {@code application/json}.
 *
 * <p>The request carries the field's {@link UploadTickets ticket} in {@value #TICKET_HEADER} — no
 * ticket, no upload (403). The custom header also forces a CORS preflight on a cross-site request,
 * which is why this endpoint, the only Mateu POST without a JSON body, is still CSRF-safe. The body
 * is the file itself (not multipart), streamed into the application's {@link FileStorage} through a
 * stream that fails past the ticket's size limit (413). Contract: {@code
 * design/uploads/file-uploads-contract.md}.
 */
public final class UploadEndpoint {

  /** The streamed upload. */
  public static final String PATH = "/mateu/v3/upload";

  /** The pre-signed target request. */
  public static final String TARGET_PATH = "/mateu/v3/upload/target";

  /** The header carrying the field's ticket. */
  public static final String TICKET_HEADER = "X-Mateu-Upload-Ticket";

  /** The header carrying the percent-encoded file name. */
  public static final String NAME_HEADER = "X-Mateu-File-Name";

  /** The server's size limit for a field that declares none. */
  public static final String MAX_BYTES_PROPERTY = "mateu.uploads.max-bytes";

  /** 100 MB. */
  public static final long DEFAULT_MAX_BYTES = 100L * 1024 * 1024;

  /** What an adapter writes back: always {@code application/json}. */
  public record Answer(int status, String body) {}

  private static final ObjectMapper JSON = new ObjectMapper();

  private final Supplier<Collection<FileStorage>> stores;

  /** Over the stores the application registered. */
  public UploadEndpoint() {
    this(FileStorages::registered);
  }

  /** Over the given stores (tests). */
  public UploadEndpoint(Supplier<Collection<FileStorage>> stores) {
    this.stores = stores;
  }

  /**
   * Streams one file into its store.
   *
   * @param ticket the {@value #TICKET_HEADER} header
   * @param encodedName the {@value #NAME_HEADER} header (percent-encoded), may be null
   * @param contentType the Content-Type header, may be null
   * @param contentLength the Content-Length header, {@code -1} when absent
   * @param body the request body
   * @param httpRequest the request (identity)
   */
  public Answer upload(
      String ticket,
      String encodedName,
      String contentType,
      long contentLength,
      InputStream body,
      HttpRequest httpRequest) {
    var granted = UploadTickets.verify(ticket, httpRequest);
    if (granted == null) {
      return forbidden();
    }
    var store = FileStorages.find(granted.storage(), stores.get());
    if (store.isEmpty()) {
      return notAvailable();
    }
    var name = fileName(percentDecoded(encodedName));
    var type = mediaType(contentType);
    long max = effectiveMax(granted.maxBytes());
    if (contentLength > max) {
      return tooLarge(max);
    }
    if (!Accept.allows(granted.accept(), name, type)) {
      return notAccepted();
    }
    if (!UploadTickets.consume(ticket, granted)) {
      return tooMany();
    }
    var limited = new LimitedInputStream(body, max);
    try {
      var stored =
          store
              .get()
              .store(
                  IncomingFile.builder()
                      .name(name)
                      .contentType(type)
                      .size(contentLength)
                      .content(limited)
                      .build(),
                  httpRequest);
      if (limited.exceeded) {
        return tooLarge(max);
      }
      if (stored == null || stored.id() == null) {
        throw new IllegalStateException("The FileStorage returned no file for " + name);
      }
      if (stored.size() < 0) {
        // the store did not say: the bytes it read are the size
        stored =
            new StoredFile(
                stored.id(), stored.name(), stored.contentType(), limited.read, stored.url());
      }
      return new Answer(200, fileAnswer(stored).toString());
    } catch (Exception e) {
      if (limited.exceeded) {
        return tooLarge(max);
      }
      return failure(e);
    }
  }

  /**
   * A pre-signed target for one file, or 404 when the store issues none (the client then streams
   * the file to {@link #PATH}).
   */
  public Answer target(String ticket, String jsonBody, HttpRequest httpRequest) {
    var granted = UploadTickets.verify(ticket, httpRequest);
    if (granted == null) {
      return forbidden();
    }
    var store = FileStorages.find(granted.storage(), stores.get());
    if (store.isEmpty()) {
      return notAvailable();
    }
    JsonNode declared;
    try {
      declared = JSON.readTree(jsonBody == null || jsonBody.isBlank() ? "{}" : jsonBody);
    } catch (IOException malformed) {
      return error(400, "Bad request", "The upload request is not valid JSON.");
    }
    var name = fileName(declared.path("name").asText(null));
    var type = mediaType(declared.path("contentType").asText(null));
    long size = declared.path("size").asLong(-1);
    long max = effectiveMax(granted.maxBytes());
    if (size > max) {
      return tooLarge(max);
    }
    if (!Accept.allows(granted.accept(), name, type)) {
      return notAccepted();
    }
    if (!store.get().directUploads()) {
      return noTarget();
    }
    if (!UploadTickets.consume(ticket, granted)) {
      return tooMany();
    }
    try {
      var target =
          store
              .get()
              .uploadTarget(
                  UploadRequest.builder().name(name).contentType(type).size(size).build(),
                  httpRequest);
      if (target == null || target.url() == null || target.file() == null) {
        return noTarget();
      }
      var answer = fileAnswer(target.file());
      answer.put("url", target.url());
      answer.put("method", target.method() == null ? "PUT" : target.method());
      var headers = answer.putObject("headers");
      if (target.headers() != null) {
        target.headers().forEach(headers::put);
      }
      return new Answer(200, answer.toString());
    } catch (Exception e) {
      return failure(e);
    }
  }

  private static ObjectNode fileAnswer(StoredFile stored) {
    var answer = JSON.createObjectNode();
    answer.put("value", stored.toValue());
    var file = answer.putObject("file");
    file.put("id", stored.id());
    file.put("name", stored.name());
    file.put("contentType", stored.contentType());
    file.put("size", stored.size());
    file.put("url", stored.url());
    return answer;
  }

  /** The field's limit, else {@value #MAX_BYTES_PROPERTY}, else {@link #DEFAULT_MAX_BYTES}. */
  static long effectiveMax(long declared) {
    if (declared > 0) {
      return declared;
    }
    var configured = MateuSettings.get(MAX_BYTES_PROPERTY);
    if (configured != null && !configured.isBlank()) {
      try {
        long value = Long.parseLong(configured.trim());
        if (value > 0) {
          return value;
        }
      } catch (NumberFormatException ignored) {
        // falls back to the default
      }
    }
    return DEFAULT_MAX_BYTES;
  }

  /** A bare file name: no path (a client may send {@code ../x} or {@code C:\x}), never blank. */
  static String fileName(String name) {
    if (name == null || name.isBlank()) {
      return "file";
    }
    var bare = name.replace('\\', '/');
    bare = bare.substring(bare.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "").trim();
    return bare.isEmpty() || bare.equals(".") || bare.equals("..") ? "file" : bare;
  }

  private static String mediaType(String contentType) {
    if (contentType == null || contentType.isBlank()) {
      return "application/octet-stream";
    }
    return contentType.trim();
  }

  private static Answer forbidden() {
    return error(403, "Forbidden", "This upload is not allowed.");
  }

  /** The ticket sent its share of files (see {@link UploadTickets#consume}). */
  private static Answer tooMany() {
    return error(
        429,
        "Too many uploads",
        "This form has sent too many files. Reload the page to upload more.");
  }

  private static Answer notAvailable() {
    return error(404, "Not found", "Uploads are not available.");
  }

  private static Answer noTarget() {
    return error(404, "Not found", "This store takes uploads through the server.");
  }

  private static Answer notAccepted() {
    return error(415, "Not accepted", "This type of file is not accepted.");
  }

  static Answer tooLarge(long max) {
    return error(413, "Too large", "This file is too large (max " + Sizes.format(max) + ").");
  }

  private static Answer failure(Exception e) {
    var message = ErrorBoundary.toMessage(e, "upload");
    return error(500, message.title(), message.text());
  }

  static Answer error(int status, String title, String text) {
    var body = JSON.createObjectNode().put("error", title).put("message", text);
    return new Answer(status, body.toString());
  }

  /** The upload body, failing once it goes past the limit. */
  static final class LimitedInputStream extends FilterInputStream {
    private final long max;
    long read;
    volatile boolean exceeded;

    LimitedInputStream(InputStream in, long max) {
      super(in);
      this.max = max;
    }

    @Override
    public int read() throws IOException {
      int b = super.read();
      if (b >= 0) {
        count(1);
      }
      return b;
    }

    @Override
    public int read(byte[] b, int off, int len) throws IOException {
      int n = super.read(b, off, len);
      if (n > 0) {
        count(n);
      }
      return n;
    }

    @Override
    public long skip(long n) throws IOException {
      long skipped = super.skip(n);
      count(skipped);
      return skipped;
    }

    private void count(long n) throws IOException {
      read += n;
      if (read > max) {
        exceeded = true;
        throw new IOException("The upload is larger than " + max + " bytes");
      }
    }
  }

  /** Human sizes: 1024 based, integer when exact, else one decimal. */
  public static final class Sizes {
    private Sizes() {}

    public static String format(long bytes) {
      String[] units = {"KB", "MB", "GB"};
      if (bytes < 1024) {
        return bytes + " bytes";
      }
      double value = bytes;
      String unit = "bytes";
      for (var candidate : units) {
        if (value < 1024) {
          break;
        }
        value /= 1024;
        unit = candidate;
      }
      if (value == Math.rint(value)) {
        return Math.round(value) + " " + unit; // a whole number here: no rounding happens
      }
      return String.format(Locale.ROOT, "%.1f %s", value, unit);
    }
  }

  /** The {@code accept} rule (§4): {@code .ext}, {@code type/*}, or an exact media type. */
  public static final class Accept {
    private Accept() {}

    public static boolean allows(String accept, String name, String contentType) {
      if (accept == null || accept.isBlank()) {
        return true;
      }
      var lowerName = name == null ? "" : name.toLowerCase(Locale.ROOT);
      var type = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
      int params = type.indexOf(';');
      if (params >= 0) {
        type = type.substring(0, params).trim();
      }
      for (var raw : accept.split(",")) {
        var entry = raw.trim().toLowerCase(Locale.ROOT);
        if (entry.isEmpty()) {
          continue;
        }
        if (entry.startsWith(".")) {
          if (lowerName.endsWith(entry)) {
            return true;
          }
        } else if (entry.endsWith("/*")) {
          if (type.startsWith(entry.substring(0, entry.length() - 1))) {
            return true;
          }
        } else if (entry.equals(type)) {
          return true;
        }
      }
      return false;
    }
  }

  /** {@code %XX} decoding ({@code +} stays a plus); a malformed escape keeps the raw text. */
  static String percentDecoded(String text) {
    if (text == null) {
      return null;
    }
    try {
      return java.net.URLDecoder.decode(text.replace("+", "%2B"), StandardCharsets.UTF_8);
    } catch (IllegalArgumentException malformed) {
      return text;
    }
  }
}
