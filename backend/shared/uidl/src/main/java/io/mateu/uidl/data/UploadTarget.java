package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.Map;
import lombok.Builder;

/**
 * A pre-signed target the client sends a file's bytes to directly (a presigned S3 PUT, an Azure SAS
 * url…). Mateu's credentials are never sent there.
 *
 * @param url where to send the bytes
 * @param method the HTTP method; null → {@code PUT}
 * @param headers headers the request must carry (e.g. {@code x-ms-blob-type}); may be null
 * @param file what the field's value refers to once the upload succeeded
 */
@Experimental("file uploads through a storage port (3.0)")
@Builder
public record UploadTarget(
    String url, String method, Map<String, String> headers, StoredFile file) {}
