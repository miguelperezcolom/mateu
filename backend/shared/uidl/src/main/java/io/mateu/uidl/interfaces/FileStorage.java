package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.IncomingFile;
import io.mateu.uidl.data.StoredFile;
import io.mateu.uidl.data.UploadRequest;
import io.mateu.uidl.data.UploadTarget;

/**
 * The port that KEEPS uploaded files. Mateu ships the UI of uploading — the file field, progress,
 * cancel, size and type limits, the upload endpoint and its security — but <b>no storage</b>: the
 * application implements this interface over the store of its choice (a disk folder, S3, Azure
 * Blob, a database…) and registers it as a bean (Spring {@code @Component}, CDI / Micronaut
 * {@code @Singleton}, …).
 *
 * <p>While a store is registered, a {@code @FileUpload} field (or any field with the {@code
 * fileUpload} stereotype) uploads the file to Mateu's {@code POST /mateu/v3/upload} endpoint, which
 * streams it into {@link #store}; the field's value becomes the {@link StoredFile#toValue()
 * reference} the store returns, never the bytes. Without one, the field keeps reading the file into
 * a data URI held in the value (fine for a small file, refused above its {@code maxBytes} — 10 MB
 * when undeclared).
 *
 * <p>Two styles, both optional beyond {@link #store}:
 *
 * <ol>
 *   <li><b>Streamed through Mateu</b> ({@link #store}): Mateu hands over the body as an {@link
 *       java.io.InputStream} that stops at the field's size limit.
 *   <li><b>Direct to the store</b> ({@link #directUploads()} + {@link #uploadTarget}): the store
 *       issues a pre-signed target (url, method, headers) and the browser sends the bytes there;
 *       Mateu never sees them. A null target falls back to the streamed style.
 * </ol>
 *
 * <pre>{@code
 * @Component
 * class DiskFileStorage implements FileStorage {
 *   private final Path root = Path.of("uploads");
 *
 *   public StoredFile store(IncomingFile file, HttpRequest httpRequest) throws Exception {
 *     var id = UUID.randomUUID().toString();
 *     Files.createDirectories(root);
 *     long size = Files.copy(file.content(), root.resolve(id));
 *     return StoredFile.builder().id(id).name(file.name()).contentType(file.contentType())
 *         .size(size).build();
 *   }
 * }
 * }</pre>
 *
 * <p>A reference that comes back in the component state is CLIENT data: resolve it through your
 * store and check the caller may read that file.
 */
@Experimental("file uploads through a storage port (3.0)")
public interface FileStorage {

  /**
   * The name a field picks this store by ({@code @FileUpload(storage = "…")}); {@code ""} (the
   * default) is the store fields without a {@code storage} use — and so is the only store
   * registered, whatever its name. A field naming a store gets only the store with that name.
   */
  default String name() {
    return "";
  }

  /**
   * Keeps a file streamed through Mateu.
   *
   * @param file the name, type, declared size and content; read the content to the end (it throws
   *     an {@link java.io.IOException} past the field's size limit — let it propagate)
   * @param httpRequest the upload request (identity, locale…)
   * @return what the field's value refers to from now on
   * @throws Exception a storage failure — reported to the user as an unexpected error
   */
  StoredFile store(IncomingFile file, HttpRequest httpRequest) throws Exception;

  /** Whether this store issues pre-signed upload targets ({@link #uploadTarget}). */
  default boolean directUploads() {
    return false;
  }

  /**
   * A pre-signed target the browser uploads the file to directly (asked only when {@link
   * #directUploads()}). Mateu has already checked the declared size and type against the field.
   *
   * @return the target, or null to have the file streamed through Mateu instead
   */
  default UploadTarget uploadTarget(UploadRequest upload, HttpRequest httpRequest)
      throws Exception {
    return null;
  }
}
