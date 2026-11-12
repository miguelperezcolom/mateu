package io.mateu.mdd.demoadminpanel.infra.in.ui.uploads;

import io.mateu.uidl.annotations.FileUpload;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.StoredFile;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Large file uploads through the app's storage port: with {@link DiskFileStorage} registered, the
 * file fields upload with a progress bar and a Cancel, and their values are the references the
 * store returns ({@code mateu-file:<id>?name=…}) — never the bytes.
 */
@UI("/file-uploads-demo")
@Title("File uploads")
public class FileUploadsDemo {

  @FileUpload(accept = ".pdf,application/pdf", maxBytes = 50L * 1024 * 1024)
  @Label("Contract (PDF, up to 50 MB)")
  String contract;

  @FileUpload(maxBytes = 200L * 1024 * 1024)
  @Label("Attachments (any type, up to 200 MB each)")
  List<String> attachments = new ArrayList<>();

  // kept inline on purpose: a small file whose bytes the code wants in the value itself
  @FileUpload(accept = "image/*", maxBytes = 512 * 1024, storage = FileUpload.INLINE)
  @Label("Thumbnail (inline data URI, up to 512 KB)")
  String thumbnail;

  @Toolbar
  Message save() {
    var files = new ArrayList<String>();
    if (contract != null) {
      files.add(contract);
    }
    files.addAll(attachments);
    var names =
        files.stream()
            .map(StoredFile::parse)
            .filter(Objects::nonNull)
            .map(f -> f.name() + " (" + f.size() + " bytes)")
            .collect(Collectors.joining(", "));
    return new Message(names.isEmpty() ? "No stored files" : "Stored: " + names);
  }
}
