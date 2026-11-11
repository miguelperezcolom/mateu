package io.mateu.mdd.demoadminpanel.infra.in.ui.uploads;

import io.mateu.uidl.data.IncomingFile;
import io.mateu.uidl.data.StoredFile;
import io.mateu.uidl.interfaces.FileStorage;
import io.mateu.uidl.interfaces.HttpRequest;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * A DEMO implementation of Mateu's {@link FileStorage} port: keeps each uploaded file in a folder
 * of the temp directory, named by a random id, and links it from {@link DemoFilesController}.
 * Mateu ships no storage — an application writes something like this over its own store (a disk,
 * S3, Azure Blob, a database…). Registering it is what turns every {@code @FileUpload} field of
 * the app from a data URI into a real upload (fields with {@code storage = FileUpload.INLINE}
 * excepted).
 */
@Component
public class DiskFileStorage implements FileStorage {

  private static final Pattern ID = Pattern.compile("[0-9a-f-]{36}");

  private final Path root = Path.of(System.getProperty("java.io.tmpdir"), "mateu-demo-uploads");

  @Override
  public StoredFile store(IncomingFile file, HttpRequest httpRequest) throws Exception {
    var id = UUID.randomUUID().toString();
    Files.createDirectories(root);
    var target = root.resolve(id);
    // the content stops (IOException) past the field's size limit: let it propagate, and drop the
    // partial file
    long size;
    try {
      size = Files.copy(file.content(), target);
    } catch (Exception tooLargeOrBroken) {
      Files.deleteIfExists(target);
      throw tooLargeOrBroken;
    }
    Files.writeString(root.resolve(id + ".meta"), file.contentType() + "\n" + file.name());
    return StoredFile.builder()
        .id(id)
        .name(file.name())
        .contentType(file.contentType())
        .size(size)
        .url("/demo-files/" + id)
        .build();
  }

  /** The stored file of {@code id}, when there is one (the id is checked: no path tricks). */
  Optional<Path> file(String id) {
    if (id == null || !ID.matcher(id).matches()) {
      return Optional.empty();
    }
    var path = root.resolve(id);
    return Files.isRegularFile(path) ? Optional.of(path) : Optional.empty();
  }

  /** The content type and the original name of {@code id}. */
  String[] meta(String id) throws java.io.IOException {
    var lines = Files.readString(root.resolve(id + ".meta")).split("\n", 2);
    return new String[] {lines[0], lines.length > 1 ? lines[1] : id};
  }
}
