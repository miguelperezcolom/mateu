"""The file storage port (EXPERIMENTAL) — Java's ``FileStorage`` / ``IncomingFile`` /
``UploadRequest`` / ``UploadTarget`` / ``StoredFile``.

Mateu ships the UI of uploading a file — the field, the progress, the streamed endpoint — but no
storage: the application writes the bytes somewhere. Subclass :class:`FileStorage` and register it
with ``add_mateu(app, ..., file_storages=[MyStorage()])`` (or put the class among the sources, it is
discovered like a ``ListingExporter`` and instantiated with no arguments). A ``FileUpload()`` field
then uploads to ``POST /mateu/v3/upload`` and its value becomes a REFERENCE string
(``mateu-file:<id>?name=…``), never the bytes.

.. code-block:: python

    class DiskStorage(FileStorage):
        async def store(self, file: IncomingFile, request) -> StoredFile:
            file_id = uuid.uuid4().hex
            with open(f"/data/{file_id}", "wb") as out:
                async for chunk in file.content:
                    out.write(chunk)
            return StoredFile(id=file_id, name=file.name, content_type=file.content_type, size=file.size)

A reference arriving in the component state is CLIENT DATA: resolve it through your store and check
the caller may read that file.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, AsyncIterator
from urllib.parse import quote, unquote

#: The scheme of a stored file's reference value.
VALUE_PREFIX = "mateu-file:"


def encode_component(text: str) -> str:
    """Percent-encoded UTF-8, escaping every byte outside ``A-Za-z0-9-._~``."""
    return quote(text, safe="")


def decode_component(text: str) -> str:
    """Decodes ``%XX`` only — ``+`` stays a literal plus."""
    return unquote(text)


@dataclass
class IncomingFile:
    """A file being uploaded: its name, content type, size (-1 when unknown) and its bytes as an
    async iterator of chunks (``async for chunk in file.content``), read once. The stream is limited
    to the field's maximum size: reading past it raises and the upload answers 413."""

    name: str
    content_type: str
    size: int
    content: AsyncIterator[bytes]

    def __aiter__(self):
        return self.content.__aiter__()

    async def read(self) -> bytes:
        """Every byte of the file at once (convenient for small files; stream big ones)."""
        out = bytearray()
        async for chunk in self.content:
            out.extend(chunk)
        return bytes(out)


@dataclass(frozen=True)
class UploadRequest:
    """What a client asks a pre-signed target for: the file's name, content type and size."""

    name: str
    content_type: str
    size: int = -1


@dataclass(frozen=True)
class StoredFile:
    """A stored file: the store's id plus what a client shows (name, type, size, a link)."""

    id: str
    name: str | None = None
    content_type: str | None = None
    size: int = -1
    url: str | None = None

    def to_value(self) -> str:
        """``mateu-file:<id>?name=<name>&type=<contentType>&size=<bytes>&url=<url>`` — absent
        params omitted (``size`` when < 0), each item percent-encoded."""
        params = []
        if self.name:
            params.append("name=" + encode_component(self.name))
        if self.content_type:
            params.append("type=" + encode_component(self.content_type))
        if self.size is not None and self.size >= 0:
            params.append("size=" + str(self.size))
        if self.url:
            params.append("url=" + encode_component(self.url))
        value = VALUE_PREFIX + encode_component(self.id or "")
        return value + ("?" + "&".join(params) if params else "")

    @staticmethod
    def parse(value: Any) -> StoredFile | None:
        """The stored file a reference value names; None for anything that is not one."""
        if not isinstance(value, str) or not value.startswith(VALUE_PREFIX):
            return None
        rest = value[len(VALUE_PREFIX):]
        raw_id, _, query = rest.partition("?")
        params: dict[str, str] = {}
        for pair in query.split("&") if query else []:
            key, _, raw = pair.partition("=")
            if key and key not in params:
                params[key] = decode_component(raw)
        size = -1
        if "size" in params:
            try:
                size = int(params["size"])
            except ValueError:
                size = -1
        return StoredFile(
            id=decode_component(raw_id),
            name=params.get("name"),
            content_type=params.get("type"),
            size=size,
            url=params.get("url"),
        )

    def to_json(self) -> dict:
        """The ``file`` object of the upload endpoints' answers."""
        return {
            "id": self.id,
            "name": self.name,
            "contentType": self.content_type,
            "size": self.size,
            "url": self.url,
        }


@dataclass(frozen=True)
class UploadTarget:
    """A pre-signed target: the client sends the bytes to ``url`` with ``method`` and ``headers``
    (no Mateu credentials) and, on a 2xx, commits ``file``'s reference as the value."""

    url: str
    file: StoredFile
    method: str = "PUT"
    headers: dict[str, str] = field(default_factory=dict)


class FileStorage:
    """The storage port the application implements (Mateu ships no S3 / Azure / disk adapter).

    - ``name`` — what a ``FileUpload(storage=…)`` names; ``""`` is the default store.
    - ``store(file, request)`` — write ``file.content`` and return the :class:`StoredFile`
      (``async def``; a plain ``def`` works too). ``request`` is the request in flight
      (``mateu_ui.core.request_context.MateuRequest``).
    - ``direct_uploads`` / ``upload_target(upload, request)`` — a store that issues pre-signed
      targets (the browser sends the bytes straight to it) sets ``direct_uploads = True`` and
      answers a :class:`UploadTarget`; None = none for this file, it is streamed through Mateu.
    """

    name: str = ""
    direct_uploads: bool = False

    async def store(self, file: IncomingFile, request) -> StoredFile:
        raise NotImplementedError("FileStorage.store")

    async def upload_target(self, upload: UploadRequest, request) -> UploadTarget | None:
        return None


__all__ = ["FileStorage", "IncomingFile", "StoredFile", "UploadRequest", "UploadTarget"]
