package io.mateu.mdd.demoadminpanel.infra.in.ui.uploads;

import java.nio.file.Files;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves back the files {@link DiskFileStorage} keeps — the {@code url} of each stored reference.
 * A real application would check that the caller may read the file; this demo serves them all.
 */
@RestController
public class DemoFilesController {

  private final DiskFileStorage storage;

  public DemoFilesController(DiskFileStorage storage) {
    this.storage = storage;
  }

  @GetMapping("/demo-files/{id}")
  public ResponseEntity<Resource> download(@PathVariable String id) throws Exception {
    var file = storage.file(id);
    if (file.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    var meta = storage.meta(id);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(meta[0]))
        .contentLength(Files.size(file.get()))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment()
                .filename(meta[1], java.nio.charset.StandardCharsets.UTF_8)
                .build()
                .toString())
        .body(new FileSystemResource(file.get()));
  }
}
