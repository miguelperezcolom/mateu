package com.example.demoremote.domains.agnostic.data;

import io.mateu.remote.domain.files.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import javax.naming.AuthenticationException;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Service
@Primary
public class DemoFileStorageService implements StorageService {

    @Value("${mateu.cdn.path}")
    private String cdnBasePath;
    @Value("${mateu.cdn.baseUrl}")
    private String cdnBaseUrl;

    private Path root;

    @Override
    @PostConstruct
    public void init() {
        try {
            root = Paths.get(cdnBasePath);
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    @Override
    public void store(String fileId, MultipartFile file) throws AuthenticationException {
        if (!fileId.startsWith("mateuremoteistheremoteflavourofmateu")) {
            throw new AuthenticationException("Not allowed to upload files here");
        }
        try {
            Files.createDirectories(this.root.resolve(fileId));
            Files.copy(file.getInputStream(), this.root.resolve(fileId + File.separator + file.getOriginalFilename()));
        } catch (Exception e) {
            if (e instanceof FileAlreadyExistsException) {
                throw new RuntimeException("A file of that name already exists.");
            }
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public Stream<Path> loadAll() throws AuthenticationException {
        try {
            return Files.walk(this.root, 2).filter(path -> !path.equals(this.root))
                    .filter(path -> !path.toFile().isDirectory())
                    .map(this.root::relativize);
        } catch (IOException e) {
            throw new RuntimeException("Could not load the files!");
        }
    }

    @Override
    public String getUrl(String fileId) throws AuthenticationException {
        try {
            Path basePath = this.root.resolve(fileId);
            return cdnBaseUrl + "cdn/" + Files.list(basePath)
                    .map(this.root::relativize)
                    .findFirst().get().toString().replaceAll("\\\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("Could not load the files!");
        }
    }

    @Override
    public Resource loadAsResource(String fileId, String filename) throws AuthenticationException {
        try {
            Path file = root.resolve("mateuremoteistheremoteflavourofmateu" + fileId + File.separator + filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    @Override
    public void deleteAll()  throws AuthenticationException {
        FileSystemUtils.deleteRecursively(root.toFile());
    }
}
