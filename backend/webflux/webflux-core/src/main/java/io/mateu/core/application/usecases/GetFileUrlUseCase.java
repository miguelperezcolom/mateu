package io.mateu.core.application.usecases;

import io.mateu.core.domain.model.files.StorageService;
import javax.naming.AuthenticationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GetFileUrlUseCase {

  private final StorageService storageService;

  public GetFileUrlUseCase(StorageService storageService) {
    this.storageService = storageService;
  }

  public String getFileUrl(String fileId, String fileName) throws AuthenticationException {
    return storageService.getUrl(fileId, fileName);
  }
}
