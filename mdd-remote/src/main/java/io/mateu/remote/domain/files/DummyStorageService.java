package io.mateu.remote.domain.files;

import io.mateu.remote.domain.files.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.nio.file.Path;
import java.util.stream.Stream;

@Service
public class DummyStorageService implements StorageService {

    @Override
    public void init() {

    }

    @Override
    public Mono<Void> store(String fileId, Mono<FilePart> file) {
        return Mono.empty();
    }

    @Override
    public Stream<Path> loadAll() {
        return null;
    }

    @Override
    public String getUrl(String fileId) {
        return null;
    }

    @Override
    public Resource loadAsResource(String fileId, String filename) {
        return null;
    }

    @Override
    public void deleteAll() {

    }
}
