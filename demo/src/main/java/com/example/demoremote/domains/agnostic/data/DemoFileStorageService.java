package com.example.demoremote.domains.agnostic.data;

import io.mateu.core.domain.model.files.StorageService;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.naming.AuthenticationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Primary
@Slf4j
public class DemoFileStorageService implements StorageService {

  @Value("${mateu.cdn.path}")
  private String cdnBasePath;

  @Value("${mateu.cdn.baseUrl}")
  private String cdnBaseUrl;

  private Path root;

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
  public Mono<Void> store(String fileId, Mono<FilePart> file) throws AuthenticationException {
    if (!fileId.startsWith("mateuremoteistheremoteflavourofmateu")) {
      throw new AuthenticationException("Not allowed to upload files here");
    }
    var cleanFileId = fileId.substring("mateuremoteistheremoteflavourofmateu".length());
    return file.doOnNext(
            part -> {
              log.info("receiving file " + part.filename());
              try {
                Files.createDirectories(this.root.resolve(cleanFileId));
                // Files.copy(part.getInputStream(), this.root.resolve(fileId + File.separator +
                // part.getOriginalFilename()));
              } catch (Exception e) {
                if (e instanceof FileAlreadyExistsException) {
                  throw new RuntimeException("A file of that name already exists.");
                }
                throw new RuntimeException(e.getMessage());
              }
            })
        .flatMap(
            part ->
                part.transferTo(this.root.resolve(cleanFileId + File.separator + part.filename())));
  }

  @Override
  public String getUrl(String fileId, String fileName) throws AuthenticationException {
    try {
      Path basePath = this.root.resolve(fileId);
      return cdnBaseUrl
          + "cdn/"
          + Files.list(basePath)
              .map(this.root::relativize)
              .filter(p -> p.endsWith(fileName))
              .findFirst()
              .get()
              .toString()
              .replaceAll("\\\\", "/");
    } catch (IOException e) {
      throw new RuntimeException("Could not load the files!");
    }
  }

  @Override
  public Resource loadAsResource(String fileId, String filename) throws AuthenticationException {
    try {
      Path file =
          root.resolve("mateuremoteistheremoteflavourofmateu" + fileId + File.separator + filename);
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
}
