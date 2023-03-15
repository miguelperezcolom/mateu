package io.mateu.remote.domain;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import javax.naming.AuthenticationException;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

    void init();

    void store(String fileId, MultipartFile file) throws AuthenticationException;

    Stream<Path> loadAll() throws AuthenticationException;

    String getUrl(String fileId) throws AuthenticationException;

    Resource loadAsResource(String fileId, String filename) throws AuthenticationException;

    void deleteAll() throws AuthenticationException;

}
