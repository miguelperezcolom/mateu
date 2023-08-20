package io.mateu.remote.domain.files;

import io.mateu.remote.domain.files.StorageService;
import jakarta.annotation.PostConstruct;
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
