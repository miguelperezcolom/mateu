"""File uploads through the application's ``FileStorage`` (EXPERIMENTAL) — the Python twin of
Java's upload tickets + ``/mateu/v3/upload`` (contract: design/uploads/file-uploads-contract.md).

A ``FileUpload()`` field the caller may edit, with a matching store registered, carries three
attributes the server adds: ``uploadUrl``, ``uploadTicket`` (a signed, caller-bound, 8 h ticket
naming the store, the field, the size limit, the accepted types and ``multiple``) and, for a store
issuing pre-signed targets, ``uploadDirect``. The endpoints accept only what a ticket allows.
"""

from __future__ import annotations

import base64
import hashlib
import threading
from collections import OrderedDict
import hmac
import logging
import os
import secrets
import time
from collections.abc import Iterable
from dataclasses import dataclass

from mateu_ui.uidl.uploads import FileStorage, decode_component, encode_component

log = logging.getLogger("mateu.uploads")

UPLOAD_PATH = "/mateu/v3/upload"
TARGET_PATH = UPLOAD_PATH + "/target"
TICKET_HEADER = "X-Mateu-Upload-Ticket"
FILE_NAME_HEADER = "X-Mateu-File-Name"
SECRET_ENV = "MATEU_UPLOADS_SECRET"
MAX_BYTES_ENV = "MATEU_UPLOADS_MAX_BYTES"
#: the size limit of a file whose field declares none, when a store is registered (100 MB)
DEFAULT_MAX_BYTES = 100 * 1024 * 1024
TICKET_TTL_SECONDS = 8 * 60 * 60
#: the reserved storage name of a field that keeps its file inline (FileUpload.INLINE)
INLINE_STORAGE = "inline"
_VERSION = "v1"


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def caller_hash(identity) -> str:
    """hex SHA-256 of ``name \\u0001 roles \\u0001 groups \\u0001 scopes \\u0001 permissions`` (each
    list sorted and comma-joined; anonymous = ``null`` and empty lists)."""
    name = getattr(identity, "name", None) if identity is not None else None

    def joined(attr: str) -> str:
        return ",".join(sorted(str(v) for v in (getattr(identity, attr, ()) or ()))) if identity else ""

    text = "\u0001".join(
        ["null" if name is None else str(name), joined("roles"), joined("groups"), joined("scopes"),
         joined("permissions")]
    )
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def format_size(size: int) -> str:
    """``N bytes`` / ``N KB`` / ``N MB`` / ``N GB`` (1024 base, integer when exact, else one decimal)."""
    if size < 1024:
        return f"{size} bytes"
    for unit, power in (("KB", 1), ("MB", 2), ("GB", 3)):
        scale = 1024 ** power
        if size < scale * 1024 or unit == "GB":
            if size % scale == 0:
                return f"{size // scale} {unit}"
            return f"{size / scale:.1f} {unit}"
    return f"{size} bytes"  # unreachable


def accepts(accept: str | None, name: str | None, content_type: str | None) -> bool:
    """The accept rule: ``.ext`` = the name's extension (case-insensitive), ``type/*`` = the
    content-type prefix, else the exact content type (case-insensitive, params dropped). Empty =
    anything."""
    entries = [e.strip().lower() for e in (accept or "").split(",") if e.strip()]
    if not entries:
        return True
    file_name = (name or "").lower()
    media = (content_type or "").split(";", 1)[0].strip().lower()
    for entry in entries:
        if entry.startswith("."):
            if file_name.endswith(entry):
                return True
        elif entry.endswith("/*"):
            if media.startswith(entry[:-1]):
                return True
        elif media == entry:
            return True
    return False


@dataclass(frozen=True)
class Ticket:
    """What a verified ticket allows."""

    storage: str
    field_id: str
    max_bytes: int
    accept: str
    multiple: bool
    caller: str
    expires: int


#: Files a ticket of a MULTIPLE field may send by default (``MATEU_UPLOADS_MAX_FILES_PER_TICKET``).
DEFAULT_MAX_FILES = 100
MAX_FILES_ENV = "MATEU_UPLOADS_MAX_FILES_PER_TICKET"
#: Files a ticket of a SINGLE-file field may send: the file and a few replacements of it.
SINGLE_FILE_USES = 10
#: How many tickets' counts are kept (least recently used first out).
MAX_TRACKED_TICKETS = 10_000


def file_name(name: str | None) -> str:
    """The BARE name a store is handed: no directory part (``/`` or ``\\``), no control
    characters, never ``.``/``..``/empty (``file`` then) — a store that writes by name must not be
    steered out of its folder by a crafted header (Java's ``UploadEndpoint.fileName``)."""
    if name is None or not name.strip():
        return "file"
    bare = name.replace("\\", "/")
    bare = bare[bare.rfind("/") + 1:]
    bare = "".join(c for c in bare if not (ord(c) < 0x20 or ord(c) == 0x7F)).strip()
    return "file" if bare in ("", ".", "..") else bare


class Uploads:
    """The registered stores + the ticket secret (one per SyncHandler)."""

    def __init__(
        self,
        storages: Iterable[FileStorage] = (),
        secret: str | bytes | None = None,
        default_max_bytes: int | None = None,
    ):
        self.storages: list[FileStorage] = [s for s in storages if s is not None]
        configured = secret if secret else os.environ.get(SECRET_ENV)
        if configured:
            self._secret = configured.encode("utf-8") if isinstance(configured, str) else configured
        else:
            # fine for one instance; a multi-instance deployment must set the secret
            self._secret = secrets.token_bytes(32)
        if default_max_bytes is None:
            try:
                default_max_bytes = int(os.environ.get(MAX_BYTES_ENV, "") or DEFAULT_MAX_BYTES)
            except ValueError:
                default_max_bytes = DEFAULT_MAX_BYTES
        self.default_max_bytes = default_max_bytes if default_max_bytes > 0 else DEFAULT_MAX_BYTES
        try:
            configured_files = int(os.environ.get(MAX_FILES_ENV, "") or DEFAULT_MAX_FILES)
        except ValueError:
            configured_files = DEFAULT_MAX_FILES
        #: the files one ticket of a MULTIPLE field may send (``add_mateu(uploads_max_files_per_ticket=)``)
        self.max_files_per_ticket = configured_files if configured_files > 0 else DEFAULT_MAX_FILES
        #: tickets seen, by the hash of the ticket: how many files each has sent (bounded LRU)
        self._uses: "OrderedDict[str, int]" = OrderedDict()
        self._uses_lock = threading.Lock()

    def consume(self, ticket: str, claims: "Ticket") -> bool:
        """Counts one file against ``ticket``: False once it sent its share — a single-file
        field's :data:`SINGLE_FILE_USES` (the file and a few replacements of it), a multiple
        field's ``max_files_per_ticket`` (100). Without a count one ticket allowed unlimited
        storage use for its 8 hours (GA review S11; Java's ``UploadTickets.consume``)."""
        cap = self.max_files_per_ticket if claims.multiple else min(SINGLE_FILE_USES, self.max_files_per_ticket)
        key = hashlib.sha256(ticket.encode("ascii", "replace")).hexdigest()
        with self._uses_lock:
            count = self._uses.get(key, 0)
            if count >= cap:
                self._uses.move_to_end(key)
                return False
            self._uses[key] = count + 1
            self._uses.move_to_end(key)
            while len(self._uses) > MAX_TRACKED_TICKETS:
                self._uses.popitem(last=False)
        return True

    def store_for(self, name: str | None) -> FileStorage | None:
        """The store a field names; blank = the default one (named ``""``, or the only one)."""
        wanted = (name or "").strip()
        for s in self.storages:
            if (getattr(s, "name", "") or "") == wanted:
                return s
        if not wanted and len(self.storages) == 1:
            return self.storages[0]
        return None

    # -- tickets -------------------------------------------------------------------------------

    def _sign(self, payload_b64: str) -> str:
        return _b64(hmac.new(self._secret, payload_b64.encode("ascii"), hashlib.sha256).digest())

    def issue(
        self, storage: str, field_id: str, max_bytes: int, accept: str, multiple: bool, identity,
        now: float | None = None,
    ) -> str:
        expires = int(now if now is not None else time.time()) + TICKET_TTL_SECONDS
        payload = "|".join([
            _VERSION, encode_component(storage or ""), encode_component(field_id or ""), str(int(max_bytes)),
            encode_component(accept or ""), "1" if multiple else "0", caller_hash(identity), str(expires),
        ])
        payload_b64 = _b64(payload.encode("utf-8"))
        return payload_b64 + "." + self._sign(payload_b64)

    def verify(self, ticket: str | None, identity, now: float | None = None) -> Ticket | None:
        """The ticket's claims when it is ours, intact, unexpired and the caller's; else None."""
        if not ticket or ticket.count(".") != 1 or not ticket.isascii():
            # a header may carry any byte: a non-ASCII one is no ticket of ours (a 403, never a 500)
            return None
        payload_b64, signature = ticket.split(".")
        if not hmac.compare_digest(self._sign(payload_b64), signature):
            return None
        try:
            parts = _unb64(payload_b64).decode("utf-8").split("|")
            if len(parts) != 8 or parts[0] != _VERSION:
                return None
            claims = Ticket(
                storage=decode_component(parts[1]),
                field_id=decode_component(parts[2]),
                max_bytes=int(parts[3]),
                accept=decode_component(parts[4]),
                multiple=parts[5] == "1",
                caller=parts[6],
                expires=int(parts[7]),
            )
        except (ValueError, UnicodeDecodeError):
            return None
        if claims.expires <= int(now if now is not None else time.time()):
            return None
        if not hmac.compare_digest(claims.caller, caller_hash(identity)):
            return None
        return claims

    # -- the field's attributes ----------------------------------------------------------------

    def field_attributes(self, marker, field_id: str, multiple: bool, read_only: bool, identity) -> list[tuple[str, str]]:
        """The attributes a ``FileUpload()`` field carries (§1 of the contract): the declared ones,
        then — with a matching store and an editable field — ``uploadUrl`` / ``uploadTicket`` /
        ``uploadDirect``."""
        out: list[tuple[str, str]] = []
        accept = getattr(marker, "accept", "") or ""
        declared_max = int(getattr(marker, "max_bytes", 0) or 0)
        storage = getattr(marker, "storage", "") or ""
        if accept:
            out.append(("accept", accept))
        if declared_max > 0:
            out.append(("maxBytes", str(declared_max)))
        if multiple:
            out.append(("multiple", "true"))
        if storage.strip():
            out.append(("storage", storage))
        # the reserved "inline" storage never goes through a store: the value stays a data URI
        store = None if storage.strip() == INLINE_STORAGE else self.store_for(storage)
        if store is None or read_only:
            return out
        out.append(("uploadUrl", UPLOAD_PATH))
        out.append((
            "uploadTicket",
            self.issue(getattr(store, "name", "") or "", field_id,
                       declared_max if declared_max > 0 else self.default_max_bytes, accept, multiple, identity),
        ))
        if getattr(store, "direct_uploads", False):
            out.append(("uploadDirect", "true"))
        return out


__all__ = [
    "DEFAULT_MAX_BYTES", "FILE_NAME_HEADER", "TARGET_PATH", "TICKET_HEADER", "UPLOAD_PATH", "Ticket", "Uploads",
    "accepts", "caller_hash", "format_size",
]
