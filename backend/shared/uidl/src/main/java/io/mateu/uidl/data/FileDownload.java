package io.mateu.uidl.data;

/**
 * The payload of a {@code DownloadFile} command. The bytes travel either inline ({@code
 * base64Content}) or behind a short-lived, single-use {@code url} the client fetches; {@code
 * disposition} says whether to show the file ({@code inline}: a new tab) or save it ({@code
 * attachment}, the default when null), and {@code print} asks the client to open the print dialog
 * for it.
 */
public record FileDownload(
    String filename,
    String mimeType,
    String base64Content,
    String url,
    String disposition,
    boolean print) {

  /** A file downloaded from inline base64 content — the original shape of the command. */
  public FileDownload(String filename, String mimeType, String base64Content) {
    this(filename, mimeType, base64Content, null, null, false);
  }
}
