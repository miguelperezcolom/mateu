package io.mateu.core.application.usecases;

import io.mateu.core.domain.model.files.StorageService;
import javax.naming.AuthenticationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class HandleFileUploadUseCase {

  private final StorageService storageService;

  public HandleFileUploadUseCase(StorageService storageService) {
    this.storageService = storageService;
  }

  public Mono<Void> handleFileUpload(String fileId, Mono<FilePart> file)
      throws AuthenticationException {
    return storageService.store(fileId, file);
  }
}
