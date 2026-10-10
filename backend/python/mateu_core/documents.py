"""Where an action's :class:`~mateu_uidl.documents.Document` waits until the browser fetches it,
and the response that hands it out (mirrors Java's ``DocumentStore`` / ``DocumentDownloads`` /
``DocumentCommands``).

The token (256 random bits) is the capability: minted only in the response to an action the user
was allowed to run, valid ONCE and for a short time (5 minutes by default). The store is bounded
(500 documents / 256 MB of eager content, oldest dropped first), in memory and per process.
"""

from __future__ import annotations

import base64
import re
import secrets
import threading
import time
import unicodedata
from collections import OrderedDict
from collections.abc import Callable
from dataclasses import dataclass
from urllib.parse import quote

from mateu_dtos import Wire
from mateu_uidl.documents import Document, DocumentDisposition

PATH_MARKER = "/mateu/v3/documents/"
MAX_ENTRIES = 500
MAX_PARKED_BYTES = 256 * 1024 * 1024

#: Documents up to this many bytes travel inline (base64) in the action response.
inline_max_bytes = 256 * 1024

_TOKEN = re.compile(r"^[A-Za-z0-9_-]{16,128}$")
_TCHARS = r"[!#$&^_.+A-Za-z0-9-]"
_MEDIA_TYPE = re.compile(
    rf"^{_TCHARS}{{1,127}}/{_TCHARS}{{1,127}}(\s*;\s*{_TCHARS}{{1,127}}=({_TCHARS}{{1,127}}|\"[^\"\\\x00-\x1f\x7f]{{0,127}}\"))*$"
)


@dataclass(frozen=True)
class Parked:
    filename: str
    media_type: str
    disposition: DocumentDisposition
    content: Callable[[], bytes]
    eager_bytes: int
    expires_at: float


class DocumentStore:
    def __init__(self, ttl_seconds: float = 300, clock: Callable[[], float] = time.monotonic):
        self._ttl = ttl_seconds
        self._clock = clock
        self._parked: OrderedDict[str, Parked] = OrderedDict()
        self._bytes = 0
        self._lock = threading.Lock()

    def park(self, document: Document) -> str:
        eager = len(document.content) if document.content is not None else 0
        payload = document.content
        if payload is not None:
            fixed = payload

            def content() -> bytes:
                return fixed
        else:
            assert document.lazy_content is not None
            content = document.lazy_content
        token = secrets.token_urlsafe(32)
        with self._lock:
            self._purge()
            self._parked[token] = Parked(
                document.filename, document.media_type, document.disposition, content, eager,
                self._clock() + self._ttl,
            )
            self._bytes += eager
            while (len(self._parked) > MAX_ENTRIES or self._bytes > MAX_PARKED_BYTES) and self._parked:
                _, oldest = self._parked.popitem(last=False)
                self._bytes -= oldest.eager_bytes
        return token

    def take(self, token: str | None) -> Parked | None:
        """The document under ``token`` — once; None when unknown, already taken or expired."""
        if token is None:
            return None
        with self._lock:
            found = self._parked.pop(token, None)
            if found is None:
                return None
            self._bytes -= found.eager_bytes
            return found if self._clock() < found.expires_at else None

    def __len__(self) -> int:
        with self._lock:
            self._purge()
            return len(self._parked)

    def _purge(self) -> None:
        now = self._clock()
        for token in [t for t, p in self._parked.items() if now >= p.expires_at]:
            self._bytes -= self._parked.pop(token).eager_bytes


#: The store the endpoint serves from.
shared = DocumentStore()


@dataclass(frozen=True)
class Served:
    status: int
    headers: dict[str, str]
    body: bytes


def serve(token: str | None, store: DocumentStore | None = None) -> Served:
    """``GET {base_url}/mateu/v3/documents/{token}``: single use, ``no-store``, ``nosniff``, an
    active type sandboxed, and a Content-Disposition with no CR/LF/quotes/path in it."""
    no_store = {"Cache-Control": "no-store"}
    if token is None or not _TOKEN.match(token):
        return Served(404, no_store, b"")
    doc = (store or shared).take(token)
    if doc is None:
        return Served(404, no_store, b"")
    try:
        body = doc.content() or b""
    except Exception:  # noqa: BLE001 - a failing lazy document answers 500, never a stack trace
        return Served(500, no_store, b"")
    media_type = safe_media_type(doc.media_type)
    headers = {
        "Content-Type": media_type,
        "Content-Disposition": content_disposition(doc.disposition, doc.filename),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
    }
    if _is_active(media_type):
        headers["Content-Security-Policy"] = "sandbox"
    return Served(200, headers, body)


def safe_filename(filename: str | None) -> str:
    if filename is None:
        return "document"
    out = []
    for ch in filename:
        cat = unicodedata.category(ch)
        out.append("_" if cat in ("Cc", "Cf", "Zl", "Zp") or ch in "/\\" else ch)
    clean = "".join(out).strip().lstrip(".")[:200]
    return clean if clean.strip() else "document"


def safe_media_type(media_type: str | None) -> str:
    trimmed = (media_type or "").strip()
    return trimmed if _MEDIA_TYPE.match(trimmed) else "application/octet-stream"


def content_disposition(disposition: DocumentDisposition, filename: str | None) -> str:
    clean = safe_filename(filename)
    ascii_name = "".join(c if 0x20 <= ord(c) < 0x7F and c not in '"\\%' else "_" for c in clean)
    kind = "inline" if disposition is DocumentDisposition.inline else "attachment"
    return f"{kind}; filename=\"{ascii_name}\"; filename*=UTF-8''{quote(clean, safe='!#$&+-.^_`|~')}"


def _is_active(media_type: str) -> bool:
    base = media_type.split(";")[0].strip().lower()
    return base == "text/html" or "xml" in base or "svg" in base or "javascript" in base or base == "text/xsl"


class FileDownload(Wire):
    """The DownloadFile payload (same fields as Java's FileDownload)."""

    filename: str
    mime_type: str
    base64_content: str | None = None
    url: str | None = None
    disposition: str | None = None
    print: bool = False


def url_for(base_url: str | None, token: str) -> str:
    return (base_url or "").rstrip("/") + PATH_MARKER + token


def to_file_download(
    document: Document, base_url: str | None, store: DocumentStore | None = None,
    inline_max: int | None = None,
) -> FileDownload:
    """Inline (base64) when small; a single-use URL when large or lazy."""
    filename = safe_filename(document.filename)
    media_type = safe_media_type(document.media_type)
    disposition = document.disposition.value
    limit = inline_max_bytes if inline_max is None else inline_max
    if document.content is not None and len(document.content) <= limit:
        return FileDownload(
            filename=filename, mime_type=media_type,
            base64_content=base64.b64encode(document.content).decode("ascii"),
            disposition=disposition, print=document.print,
        )
    token = (store or shared).park(document)
    return FileDownload(
        filename=filename, mime_type=media_type, url=url_for(base_url, token),
        disposition=disposition, print=document.print,
    )
