---
title: "Large file uploads"
description: "Upload a 20 MB PDF from a form field: the file goes to a storage port your application implements, the field keeps a reference — never the bytes."
---

:::caution[Experimental (3.0)]
The storage port and the upload endpoint are `@Experimental`: the contract may still change in a
3.x minor release.
:::

A `@FileUpload` field reads the picked file into a **data URI** held in the field's value. That is
fine for a photo or a small CSV, and unusable for a 20 MB PDF: the bytes would travel back and
forth in the component state on every action.

For real files, Mateu uploads them — with a progress bar, a Cancel, server-side size and type
limits — to a **storage port your application implements**. Mateu ships the UI of uploading and
the endpoint that receives the file; it ships **no storage** (no disk, S3 or Azure adapter): you
write the few lines that keep the file wherever your files live, exactly as you write a
[listing exporter](/java-ui-definition/interfaces/listing/#export-engines).

## 1. Implement the port

```java
@Component   // Spring; a CDI / Micronaut @Singleton works the same
class DiskFileStorage implements FileStorage {

  private final Path root = Path.of("uploads");

  @Override
  public StoredFile store(IncomingFile file, HttpRequest httpRequest) throws Exception {
    var id = UUID.randomUUID().toString();
    Files.createDirectories(root);
    long size = Files.copy(file.content(), root.resolve(id)); // streamed, never in memory
    return StoredFile.builder()
        .id(id).name(file.name()).contentType(file.contentType()).size(size)
        .url("/files/" + id)          // optional: where the UI links the file
        .build();
  }
}
```

`file.content()` is the request body as it arrives, wrapped in a stream that **throws an
`IOException` past the field's size limit** — let it propagate (and drop the partial file). A throw
is answered as an unexpected error, with a reference in the log.

As soon as a `FileStorage` bean is registered, every editable `@FileUpload` field of the app
uploads through it.

## 2. Declare the field

```java
@FileUpload(accept = ".pdf,application/pdf", maxBytes = 50L * 1024 * 1024)
String contract;                       // one file: a reference

@FileUpload(maxBytes = 200L * 1024 * 1024)
List<String> attachments;              // several files: a list of references
```

| Attribute | Meaning |
|---|---|
| `accept` | Comma list for the file input — `.pdf`, `image/*`, `application/pdf`. Enforced by the server too. |
| `maxBytes` | The largest ONE file may weigh. `0` = the server's default, `mateu.uploads.max-bytes` (100 MB). Enforced while the file streams (413 past it). |
| `multiple` | Several files (the value is a list). Inferred for a `List<String>` / `Set<String>` / array field. |
| `storage` | The `FileStorage.name()` to use when the app registers several; blank = the default store (the one named `""`, or the only one). `FileUpload.INLINE` keeps the field a data URI even with a store — for code that reads the bytes from the value, like the import wizard's CSV. |

Fluent and YAML fields carry the same options in their generic `attributes` (`stereotype:
fileUpload`, `attributes: {accept: .pdf, maxBytes: "52428800", multiple: "true"}`).

## 3. Read the value

The value is a **reference**, never the bytes:

```
mateu-file:<id>?name=contract.pdf&type=application%2Fpdf&size=1048576&url=%2Ffiles%2F<id>
```

```java
@Toolbar
Message save() {
  var stored = StoredFile.parse(contract);   // null for a data URI or a plain URL
  repository.attach(order, stored.id());
  return Message.success("Saved " + stored.name());
}
```

:::danger[A reference in the state is client data]
The value comes back from the browser like any other field. Resolve it through your store and
check that the caller may read that file before you use it — Mateu does not.
:::

## Direct uploads to the store (pre-signed targets)

A store that can issue pre-signed URLs (S3, Azure Blob, GCS…) can have the browser send the bytes
**straight to it**, so they never cross your server:

```java
@Override public boolean directUploads() { return true; }

@Override
public UploadTarget uploadTarget(UploadRequest upload, HttpRequest httpRequest) {
  var key = UUID.randomUUID().toString();
  return UploadTarget.builder()
      .url(presignedPutUrl(key, upload.contentType()))   // your SDK
      .method("PUT")
      .headers(Map.of("Content-Type", upload.contentType()))
      .file(StoredFile.builder().id(key).name(upload.name())
          .contentType(upload.contentType()).size(upload.size()).build())
      .build();
}
```

Mateu checks the declared size and type against the field before asking you. Return `null` for a
file you prefer to receive through `store` instead. The browser sends no Mateu credentials to the
pre-signed URL — only the headers you return. Your store must allow that origin (CORS on the
bucket).

## Without a storage port

No `FileStorage` registered (or `storage = FileUpload.INLINE`): the field keeps today's behaviour —
the file is read in the browser into a data URI stored in the value — and the client **refuses a
file larger than `maxBytes`, or 10 MB when undeclared**, with *"This file is too large (max 10 MB)."*.

## Security

- The endpoint is `POST /mateu/v3/upload` (and `/mateu/v3/upload/target`), at the root path, on
  every adapter (Spring MVC, WebFlux, Micronaut, Quarkus, Helidon MP) and on the .NET and Python
  ports. Its body is the raw file, not multipart.
- Each editable upload field the caller is SHOWN carries a short-lived, signed **ticket** naming the
  store, the field's limits and a hash of the caller's identity. No ticket, a forged or expired one,
  or another caller's → 403. A read-only field, or one hidden by `@EyesOnly` / an access key, never
  gets a ticket.
- A ticket sends a bounded number of files: 10 for a single-file field (the file and its
  replacements before the form is saved), `mateu.uploads.max-files-per-ticket` (100) for a
  `multiple` one; past it → 429 *"Too many uploads"*, and a reload of the page issues a new ticket.
- The ticket travels in the `X-Mateu-Upload-Ticket` header: a cross-site page cannot send it
  without a CORS preflight, which is what makes the endpoint CSRF-safe without a JSON body (Spring
  Security's CSRF exemption covers it). CORS follows the usual `mateu.cors.allowed-origins`.
- Tickets are signed with `mateu.uploads.secret` / `MATEU_UPLOADS_SECRET`; without it each process
  draws a random secret — fine for one instance, but **a deployment of several instances must set
  it**, or a ticket issued by one is refused by the others.

## .NET and Python

```csharp
builder.Services.AddSingleton<IFileStorage, DiskFileStorage>();

class DiskFileStorage : IFileStorage
{
    public async Task<StoredFile> StoreAsync(IncomingFile file, IncomingRequest request)
    {
        var id = Guid.NewGuid().ToString();
        await using var target = File.Create(Path.Combine("uploads", id));
        await file.Content.CopyToAsync(target);
        return new StoredFile(id, file.Name, file.ContentType, target.Length);
    }
}

[FileUpload(".pdf", MaxBytes = 50 * 1024 * 1024)] public string? Contract { get; set; }
```

```python
import os
import uuid
from pathlib import Path

from fastapi import FastAPI

import views  # your module of @ui classes


class DiskFileStorage(FileStorage):
    async def store(self, file: IncomingFile, request) -> StoredFile:
        id = uuid.uuid4().hex  # the store picks the name: never the client's
        size = 0
        with open(Path("uploads") / id, "wb") as target:
            async for chunk in file.content:
                target.write(chunk)
                size += len(chunk)
        return StoredFile(id=id, name=file.name, content_type=file.content_type, size=size)


app = FastAPI()
add_mateu(app, views, file_storages=[DiskFileStorage()], uploads_secret=os.environ["SECRET"])

# on a view:
contract: Annotated[str, FileUpload(accept=".pdf", max_bytes=50 * 1024 * 1024)] = ""
```

Options: .NET `MateuOptions.UploadsSecret`; Python `add_mateu(uploads_secret=…)`; both read
`MATEU_UPLOADS_SECRET` otherwise.

## Renderers

| Renderer | Upload mode |
|---|---|
| Web (Vaadin) | ✅ progress, Cancel, errors, several files, direct uploads |
| React Native | ✅ progress, Cancel, errors, several files, direct uploads |
| IntelliJ / desktop | ✅ progress, Cancel, errors, several files, direct uploads |
| Redwood | 🟡 shows a stored reference (name · size); picking a file still stores a data URI — an app serving Redwood must accept both values |

Demo: `demo/demo-admin-panel` — `/file-uploads-demo` over a disk-backed `DiskFileStorage`.
