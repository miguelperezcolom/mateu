package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.Objects;
import java.util.function.Supplier;

/**
 * A document produced by an action — an invoice, a registration card, a report. Return it from any
 * action method (alone or inside a {@code List} with messages and commands) and the client shows it
 * ({@link DocumentDisposition#inline}: a PDF opens in a new tab) or downloads it ({@link
 * DocumentDisposition#attachment}).
 *
 * <pre>{@code
 * @Toolbar
 * Document invoice() {
 *   return Document.pdf("invoice-" + id + ".pdf", renderer.render(html));
 * }
 * }</pre>
 *
 * <p>Small documents travel inside the action response; large ones and every {@link #lazy(String,
 * String, Supplier) lazy} one are parked on the server and fetched by the browser from a
 * short-lived, single-use URL ({@code <baseUrl>/mateu/v3/documents/<token>}), so the bytes never
 * get base64-inflated into the JSON. A lazy document's content is produced when the browser asks
 * for it, not while the action runs.
 *
 * @param filename the name the browser saves it under (sanitised before it reaches a header)
 * @param mediaType its media type ({@code application/pdf}, {@code text/csv}…)
 * @param content the bytes, or null when {@code lazyContent} produces them
 * @param lazyContent produces the bytes on demand, or null when {@code content} carries them
 * @param disposition show it or save it
 * @param print open the browser's print dialog for it as soon as it is shown (inline only)
 */
@Experimental("documents API, 2026-10")
public record Document(
    String filename,
    String mediaType,
    byte[] content,
    Supplier<byte[]> lazyContent,
    DocumentDisposition disposition,
    boolean print) {

  /** The PDF media type. */
  public static final String PDF = "application/pdf";

  public Document {
    Objects.requireNonNull(filename, "filename");
    if (content == null && lazyContent == null) {
      throw new IllegalArgumentException("A document needs content or lazyContent");
    }
    if (mediaType == null || mediaType.isBlank()) {
      mediaType = "application/octet-stream";
    }
    if (disposition == null) {
      disposition = DocumentDisposition.attachment;
    }
    if (disposition == DocumentDisposition.attachment) {
      print = false;
    }
  }

  /** A document the client shows (a PDF opens in a new tab with the browser's viewer). */
  public static Document inline(String filename, String mediaType, byte[] content) {
    return new Document(filename, mediaType, content, null, DocumentDisposition.inline, false);
  }

  /** A document the client downloads. */
  public static Document attachment(String filename, String mediaType, byte[] content) {
    return new Document(filename, mediaType, content, null, DocumentDisposition.attachment, false);
  }

  /** A PDF shown inline — the common case: preview it, then print or save it from the viewer. */
  public static Document pdf(String filename, byte[] content) {
    return inline(filename, PDF, content);
  }

  /**
   * A document whose bytes are produced only when the browser fetches it (always through the
   * short-lived download URL). Downloaded by default; {@link #showInline()} to preview it.
   */
  public static Document lazy(String filename, String mediaType, Supplier<byte[]> content) {
    return new Document(
        filename,
        mediaType,
        null,
        Objects.requireNonNull(content, "content"),
        DocumentDisposition.attachment,
        false);
  }

  /** The same document, shown instead of downloaded. */
  public Document showInline() {
    return new Document(
        filename, mediaType, content, lazyContent, DocumentDisposition.inline, print);
  }

  /** The same document, downloaded instead of shown. */
  public Document downloaded() {
    return new Document(
        filename, mediaType, content, lazyContent, DocumentDisposition.attachment, false);
  }

  /**
   * The same document, shown and handed to the browser's print dialog at once (a folio printed at
   * the front desk). Implies {@link DocumentDisposition#inline}.
   */
  public Document printed() {
    return new Document(
        filename, mediaType, content, lazyContent, DocumentDisposition.inline, true);
  }

  /** The bytes: {@code content} when it was given, else whatever {@code lazyContent} produces. */
  public byte[] bytes() {
    return content != null ? content : lazyContent.get();
  }

  /** Whether the bytes are only produced on demand (not a getter name: see the record rule). */
  public boolean producedOnDemand() {
    return content == null;
  }
}
