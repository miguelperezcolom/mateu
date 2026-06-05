---
title: "File Upload"
description: "Allow users to upload one or more files from a form field."
---

A form field of type `file` renders an upload widget. The user selects one or more files; each is POSTed independently to `/upload`. The server stores the file and returns an identifier; that identifier is kept in the form state alongside the original filename. When the form is submitted, the Java field contains the full list of uploaded file references.

---

## Declaring a file field (declarative API)

Use `io.mateu.uidl.data.File[]` as the field type. Mateu infers `dataType = file` automatically and renders the upload widget.

```java
import io.mateu.uidl.data.File;

public class DocumentForm {

    File[] attachments;   // renders as an upload widget

    @Button
    Object save() {
        // attachments[] contains one entry per uploaded file:
        //   .id()   → value returned by POST /upload
        //   .name() → original filename chosen by the user
        for (File f : attachments) {
            store(f.id(), f.name());
        }
        return Message.success("Saved");
    }
}
```

To **pre-populate** the widget with files already stored (e.g. when editing a record), initialise the array:

```java
File[] attachments = {
    new File("/var/uploads/contract.pdf", "contract.pdf"),
    new File("/var/uploads/invoice.pdf",  "invoice.pdf")
};
```

---

## Declaring a file field (fluent API)

```java
FormField.builder()
    .id("attachments")
    .label("Attachments")
    .dataType(FieldDataType.file)
    .build()
```

---

## The `File` record

```java
package io.mateu.uidl.data;

public record File(String id, String name) {}
```

| Field | Description |
|---|---|
| `id` | Opaque identifier returned by `POST /upload` — a file path, UUID, S3 key, etc. |
| `name` | Original filename displayed to the user in the upload widget |

---

## The required `/upload` endpoint

The frontend always POSTs file data to the **fixed path `/upload`**. You must expose this endpoint in your application. It must:

- Accept `multipart/form-data`
- Return the file identifier as **plain text** (`text/plain`)

The returned string becomes the `id` in `File`.

### Spring Boot

```java
@RestController
public class FileUploadController {

    @PostMapping(value = "/upload",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
                 produces = MediaType.TEXT_PLAIN_VALUE)
    public String upload(@RequestParam("file") MultipartFile file) throws IOException {
        Path dest = Path.of("/var/uploads", UUID.randomUUID() + "_" + file.getOriginalFilename());
        file.transferTo(dest);
        return dest.toString();   // this string becomes File.id()
    }
}
```

### Micronaut (reactive)

```java
@Controller("/upload")
public class FileUploadController {

    @Post(consumes = MediaType.MULTIPART_FORM_DATA, produces = MediaType.TEXT_PLAIN)
    Mono<HttpResponse<String>> upload(StreamingFileUpload file) throws IOException {
        var temp = java.io.File.createTempFile(file.getFilename(), ".tmp");
        return Mono.fromDirect(file.transferTo(temp))
                   .map(ok -> ok
                       ? HttpResponse.ok(temp.getAbsolutePath())
                       : HttpResponse.<String>status(HttpStatus.CONFLICT).body("Upload failed"));
    }
}
```

### Quarkus

```java
@Path("/upload")
public class FileUploadResource {

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.TEXT_PLAIN)
    public String upload(@MultipartForm FileUploadInput input) throws IOException {
        Path dest = Files.createTempFile("upload-", input.fileName());
        Files.write(dest, input.data());
        return dest.toString();
    }
}
```

---

## End-to-end flow

```
1. User selects a file in the upload widget
2. Browser POSTs the file to POST /upload
3. Server stores the file, returns its identifier as plain text
4. Frontend adds { id: <responseText>, name: <originalName> } to the field value
5. User removes a file → frontend removes the entry from the array
6. User submits the form → action handler receives File[] with one entry per upload
7. Action handler uses File.id() to locate each stored file
```

---

## Notes

- The `/upload` path is fixed — all file fields in all forms post to the same endpoint. Use the returned `id` to distinguish files (e.g. include a subfolder or UUID in the returned path).
- The upload happens **immediately** when the user selects the file, before the form is submitted. If the user cancels the form, the uploaded file may need to be cleaned up server-side.
- To restrict accepted file types or maximum size, apply those constraints inside your `/upload` handler — Mateu does not enforce them.
