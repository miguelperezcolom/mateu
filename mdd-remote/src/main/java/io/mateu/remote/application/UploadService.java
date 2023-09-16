package io.mateu.remote.application;

import io.mateu.remote.domain.files.StorageService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import javax.naming.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class UploadService {

  @Autowired StorageService storageService;

  public ResponseEntity<Resource> serveFile(String fileId, String filename)
      throws AuthenticationException {
    Resource file = storageService.loadAsResource(fileId, filename);
    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
        .body(file);
  }

  public String getFileUrl(String fileId, String fileName) throws AuthenticationException {
    return storageService.getUrl(fileId, fileName);
  }

  public Mono<Void> handleFileUpload(String fileId, Mono<FilePart> file)
      throws AuthenticationException, ExecutionException, InterruptedException, TimeoutException {
    return storageService.store(fileId, file);
  }
}
