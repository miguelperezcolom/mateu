package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.io.InputStream;
import lombok.Builder;

/**
 * A file arriving at {@link io.mateu.uidl.interfaces.FileStorage#store}.
 *
 * @param name the file name the user picked (never a path)
 * @param contentType its media type ({@code application/octet-stream} when the client sent none)
 * @param size the size the client declared, or {@code -1} when unknown
 * @param content the bytes; reading fails with an {@link java.io.IOException} past the field's
 *     limit
 */
@Experimental("file uploads through a storage port (3.0)")
@Builder
public record IncomingFile(String name, String contentType, long size, InputStream content) {}
