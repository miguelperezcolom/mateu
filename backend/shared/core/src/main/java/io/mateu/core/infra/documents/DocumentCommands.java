package io.mateu.core.infra.documents;

import io.mateu.uidl.data.Document;
import io.mateu.uidl.data.FileDownload;
import java.util.Base64;

/**
 * Lowers an action's {@link Document} to the payload of the {@code DownloadFile} command.
 *
 * <p>The transport is decided here: a document of at most {@link DocumentStore#inlineMaxBytes()}
 * bytes travels inline (base64, one round trip, nothing kept on the server); a larger one — and
 * every lazy one, whose size is unknown until it is produced — is parked in the {@link
 * DocumentStore} and the command carries a single-use URL under the UI's base URL instead.
 */
public final class DocumentCommands {

  private DocumentCommands() {}

  public static FileDownload toFileDownload(Document document, String baseUrl) {
    return toFileDownload(
        document, baseUrl, DocumentStore.shared(), DocumentStore.inlineMaxBytes());
  }

  public static FileDownload toFileDownload(
      Document document, String baseUrl, DocumentStore store, int inlineMaxBytes) {
    String filename = DocumentDownloads.safeFilename(document.filename());
    String mediaType = DocumentDownloads.safeMediaType(document.mediaType());
    String disposition = document.disposition().name();
    if (!document.producedOnDemand() && document.content().length <= inlineMaxBytes) {
      return new FileDownload(
          filename,
          mediaType,
          Base64.getEncoder().encodeToString(document.content()),
          null,
          disposition,
          document.print());
    }
    String token = store.park(document);
    return new FileDownload(
        filename, mediaType, null, urlFor(baseUrl, token), disposition, document.print());
  }

  /** {@code <baseUrl>/mateu/v3/documents/<token>}, with no doubled slash. */
  public static String urlFor(String baseUrl, String token) {
    String base = baseUrl == null ? "" : baseUrl;
    while (base.endsWith("/")) {
      base = base.substring(0, base.length() - 1);
    }
    return base + DocumentDownloads.PATH_MARKER + token;
  }
}
