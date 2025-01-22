package io.mateu.core.application.usecases;

import io.mateu.core.domain.model.files.StorageService;
import javax.naming.AuthenticationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ServeFileUseCase {

  private final StorageService storageService;

  public ServeFileUseCase(StorageService storageService) {
    this.storageService = storageService;
  }

  public ResponseEntity<Resource> serveFile(String fileId, String filename)
      throws AuthenticationException {
    Resource file = storageService.loadAsResource(fileId, filename);
    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
        .body(file);
  }
}
