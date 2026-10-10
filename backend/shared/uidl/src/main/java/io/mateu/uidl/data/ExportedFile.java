package io.mateu.uidl.data;

/**
 * The file a {@link io.mateu.uidl.interfaces.ListingExporter} produced. Mateu delivers it to the
 * user as a download.
 *
 * @param content the file's bytes
 * @param mediaType its media type; null → the format's default ({@link
 *     ExportFormat#defaultMediaType()})
 * @param filename the name the browser saves it under; null → the format's default ({@link
 *     ExportFormat#defaultFilename()})
 */
public record ExportedFile(byte[] content, String mediaType, String filename) {

  /** A file with the format's default media type and filename. */
  public static ExportedFile of(byte[] content) {
    return new ExportedFile(content, null, null);
  }
}
