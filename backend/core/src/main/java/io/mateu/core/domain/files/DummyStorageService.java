package io.mateu.core.domain.files;

import org.springframework.core.io.Resource;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class DummyStorageService implements StorageService {

  @Override
  public Mono<Void> store(String fileId, Mono<FilePart> file) {
    return Mono.empty();
  }

  @Override
  public String getUrl(String fileId, String fileName) {
    return null;
  }

  @Override
  public Resource loadAsResource(String fileId, String fileName) {
    return null;
  }
}
