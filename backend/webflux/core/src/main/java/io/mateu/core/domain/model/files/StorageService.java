package io.mateu.core.domain.model.files;

import javax.naming.AuthenticationException;
import org.springframework.core.io.Resource;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

public interface StorageService {

  Mono<Void> store(String fileId, Mono<FilePart> file) throws AuthenticationException;

  String getUrl(String fileId, String fileName);

  Resource loadAsResource(String fileId, String filename);
}
