package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * What the client declares when it asks for a pre-signed upload target ({@link
 * io.mateu.uidl.interfaces.FileStorage#uploadTarget}). Already checked against the field's size and
 * type limits.
 *
 * @param name the file name
 * @param contentType its media type
 * @param size its size in bytes, or {@code -1} when unknown
 */
@Experimental("file uploads through a storage port (3.0)")
@Builder
public record UploadRequest(String name, String contentType, long size) {}
