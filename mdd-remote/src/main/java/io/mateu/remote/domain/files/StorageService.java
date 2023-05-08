package io.mateu.remote.domain.files;

import org.springframework.core.io.Resource;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

    void init();

    Mono<Void> store(String fileId, Mono<FilePart> file) throws AuthenticationException;

    Stream<Path> loadAll() throws AuthenticationException;

    String getUrl(String fileId) throws AuthenticationException;

    Resource loadAsResource(String fileId, String filename) throws AuthenticationException;

    void deleteAll() throws AuthenticationException;

}
