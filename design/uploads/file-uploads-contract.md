# File uploads through a storage port — the contract (all backends, all renderers)

Owner rule: Mateu ships UI only. Storage is a PORT the application implements (`FileStorage`), like
`ListingExporter`; Mateu ships no S3/Azure/disk adapter. Status: `@Experimental` for 3.0.

## 1. Declaring the field

A field with stereotype `fileUpload` (Java `@FileUpload`, .NET `[FileUpload]`, Python `FileUpload()`,
fluent/YAML `stereotype: fileUpload`). Its options travel in the field's generic `attributes`
(wire `FormFieldDto.attributes`, a list of `{key, value}` string pairs — NO new wire member):

| attribute   | set by        | meaning |
|-------------|---------------|---------|
| `accept`    | declaration   | comma list: `.pdf`, `application/pdf`, `image/*` (already existed) |
| `maxBytes`  | declaration   | max size of ONE file, decimal bytes. Absent → server default (`mateu.uploads.max-bytes`, 100 MB) when a store is registered; 10 MB in the data-URI fallback |
| `multiple`  | declaration   | `"true"` → several files; the value is a LIST (Java `List<String>` field infers it) |
| `storage`   | declaration   | the `FileStorage.name()` to use; absent/blank → the default store (name `""`, or the only one registered); the reserved `inline` → never a store, always the data URI (used by the import wizard, whose code parses the CSV from the value) |
| `uploadUrl` | SERVER        | where to upload: `/mateu/v3/upload` (root-relative, resolved against the backend origin the UI talks to) |
| `uploadTicket` | SERVER     | opaque signed ticket (see §3); its presence switches the client to upload mode |
| `uploadDirect` | SERVER     | `"true"` when the store issues pre-signed targets: ask `uploadUrl + "/target"` first |

The server adds `uploadUrl` / `uploadTicket` (/ `uploadDirect`) only when (a) a matching store is
registered and (b) the field is NOT read-only. A field the caller may not see is never rendered, so
it never gets a ticket (access keys / `@EyesOnly` / `@ReadOnlyUnless` are respected that way).

**Fallback (no store registered or no ticket)**: today's behaviour — the file is read client-side
into a data URI stored as the value — but the client REFUSES a file larger than `maxBytes` (or
10 MB = 10485760 when undeclared) with the message `This file is too large (max <size>).`

## 2. The value

The field's value is a REFERENCE string, never the bytes (a list of them when `multiple`):

```
mateu-file:<id>?name=<name>&type=<contentType>&size=<bytes>&url=<url>
```

Each `<…>` is percent-encoded UTF-8, escaping every byte outside `A-Za-z0-9-._~`; decoding only
understands `%XX` (`+` is a literal plus). Absent or EMPTY params are omitted (`size` omitted when unknown,
i.e. < 0). Parameter order as above. Helpers: Java `StoredFile.toValue()` / `StoredFile.parse(value)`
(null for a non-`mateu-file:` value); .NET `StoredFile.ToValue()` / `StoredFile.Parse(value)`;
Python `StoredFile.to_value()` / `StoredFile.parse(value)`.

A reference arriving in the component state is CLIENT DATA: the app resolves it through its store
(and should check the caller may read that file). Documented, not enforced.

Clients show `name` (fallback: id), link to `url` when it is http(s), show size.

## 3. The ticket

`base64url(payload) "." base64url(HMAC-SHA256(secret, base64url(payload)))`, no padding.
payload = `v1|<storage>|<fieldId>|<maxBytes>|<accept>|<multiple 0|1>|<callerHash>|<expiresEpochSeconds>`,
each text item percent-encoded as in §2. TTL 8 h. `callerHash` = hex SHA-256 of
`name \u0001 sorted(roles) \u0001 sorted(groups) \u0001 sorted(scopes) \u0001 sorted(permissions)`
(comma-joined lists; anonymous = name `null`/empty lists — each backend uses its own identity
resolution). Secret: setting `mateu.uploads.secret` / env `MATEU_UPLOADS_SECRET` (.NET option
`UploadsSecret`, Python `add_mateu(uploads_secret=…)`), else random per process (fine for one
instance; a multi-instance deployment must set it). A backend only verifies its own tickets.

## 4. Endpoints (every backend, ROOT path)

### `POST /mateu/v3/upload` — streamed through Mateu
Request headers: `X-Mateu-Upload-Ticket: <ticket>` (REQUIRED — its absence is 403; a custom header
also forces a CORS preflight, which is what makes the endpoint CSRF-safe without a JSON body),
`X-Mateu-File-Name: <percent-encoded name>`, `Content-Type: <file type>` (absent →
`application/octet-stream`), `Content-Length` (when known). Body: the raw bytes (NOT multipart).
The server streams the body into `FileStorage.store(IncomingFile, request)` with a limiting stream
(over `maxBytes` → abort + 413). It checks `Content-Length` up front.

200 → `{"value": "mateu-file:…", "file": {"id","name","contentType","size","url"}}`

### `POST /mateu/v3/upload/target` — pre-signed target (only when `uploadDirect`)
Same ticket header; JSON body `{"name","contentType","size"}`. Size/type checked up front.
200 → `{"url","method","headers":{…},"value":"mateu-file:…","file":{…}}`: the client sends the
bytes to `url` with `method` (default PUT) + `headers` (NO Mateu credentials to that url) and,
on a 2xx, commits `value`. 404 `{"error":…}` → the store issued none: stream to `/mateu/v3/upload`.

An invalid JSON body on `/target` → 400 `Bad request`.

### Errors (both): JSON `{"error": "<title>", "message": "<text>"}`
| status | when | message |
|---|---|---|
| 403 | ticket missing, malformed, bad signature, expired, other caller | `Forbidden` / `This upload is not allowed.` |
| 404 | the ticket's store is no longer registered | `Not found` / `Uploads are not available.` |
| 413 | over maxBytes | `Too large` / `This file is too large (max 20 MB).` |
| 415 | not accepted | `Not accepted` / `This type of file is not accepted.` |
| 500 | the store threw | error boundary: `Something went wrong` / `An unexpected error occurred. Reference: <id>` |

Sizes print as `N bytes`, `N KB`, `N MB`, `N GB` (1024 base, integer when exact, else one decimal).

Accept rule: an entry starting with `.` matches the name's extension (case-insensitive); `type/*`
matches the content-type prefix; otherwise exact content-type match (case-insensitive, params
dropped). Empty accept = anything.

The JSON-body guard (415 to non-JSON POSTs under `/mateu/v3/`) EXEMPTS exactly `/mateu/v3/upload`;
the Spring CSRF exemption covers it when the ticket header is present. CORS: the usual Mateu policy.

## 5. The port

```java
public interface FileStorage {               // uidl io.mateu.uidl.interfaces
  default String name() { return ""; }
  StoredFile store(IncomingFile file, HttpRequest httpRequest) throws Exception;
  default boolean directUploads() { return false; }
  default UploadTarget uploadTarget(UploadRequest upload, HttpRequest httpRequest) throws Exception { return null; }
}
record IncomingFile(String name, String contentType, long size /* -1 unknown */, InputStream content)
record UploadRequest(String name, String contentType, long size)
record UploadTarget(String url, String method, Map<String,String> headers, StoredFile file)
record StoredFile(String id, String name, String contentType, long size, String url)
```
.NET: `IFileStorage { string Name => ""; Task<StoredFile> StoreAsync(IncomingFile, HttpContext);
bool DirectUploads => false; Task<UploadTarget?> UploadTargetAsync(UploadRequest, HttpContext) }`
registered as DI services. Python: `FileStorage` base class (`name`, `async def store(file, request)`
(file.content = async byte iterator / file-like), `direct_uploads`, `async def upload_target(...)`),
registered via `add_mateu(file_storages=[…])` or discovered like `ListingExporter`.

## 6. Clients
- web (`mateu-file-upload`): upload mode with progress bar, cancel (abort), error text, multiple.
- React Native / IntelliJ: upload mode (pick → stream with the app's Mateu credentials → value).
- Redwood: keeps the data-URI field; with a ticket it uploads too if cheap, else documented partial.
