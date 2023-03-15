package io.mateu.remote.domain;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;

@Service
public class DummyStorageService implements StorageService {

    @Override
    public void init() {

    }

    @Override
    public void store(String fileId, MultipartFile file) {

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
