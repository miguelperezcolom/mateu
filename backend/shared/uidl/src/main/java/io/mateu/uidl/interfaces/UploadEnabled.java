package io.mateu.uidl.interfaces;

/**
 * Marks a view that handles file uploads. Implement {@link #processUpload(String, HttpRequest)} to
 * process an uploaded file (identified by {@code fileId}) and return the resulting value/response.
 */
public interface UploadEnabled {

  Object processUpload(String fileId, HttpRequest httpRequest);
}
