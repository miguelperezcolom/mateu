package io.mateu.uidl.interfaces;

public interface UploadEnabled {

  Object processUpload(String fileId, HttpRequest httpRequest);
}
