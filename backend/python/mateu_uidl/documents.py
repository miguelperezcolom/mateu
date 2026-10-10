"""Documents produced by actions — an invoice, a registration card, a report (EXPERIMENTAL).

Return a :class:`Document` from an action (alone or in a list with messages and commands) and the
client shows it (``inline``: a PDF opens in a new tab) or downloads it (``attachment``). Small
documents travel inside the response; large ones and every lazy one are parked on the server and
fetched once from ``{base_url}/mateu/v3/documents/{token}``. Mirrors Java's
``io.mateu.uidl.data.Document``.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, replace
from enum import Enum


class DocumentDisposition(Enum):
    """Show the document (``inline``) or save it (``attachment``)."""

    inline = "inline"
    attachment = "attachment"


PDF = "application/pdf"


@dataclass(frozen=True)
class Document:
    filename: str
    media_type: str = "application/octet-stream"
    content: bytes | None = None
    lazy_content: Callable[[], bytes] | None = None
    disposition: DocumentDisposition = DocumentDisposition.attachment
    print: bool = False

    def __post_init__(self) -> None:
        if self.content is None and self.lazy_content is None:
            raise ValueError("A document needs content or lazy_content")
        if not self.media_type or not self.media_type.strip():
            object.__setattr__(self, "media_type", "application/octet-stream")
        # an attachment is never printed: printing needs it shown
        if self.disposition is DocumentDisposition.attachment and self.print:
            object.__setattr__(self, "print", False)

    @staticmethod
    def inline(filename: str, media_type: str, content: bytes) -> "Document":
        return Document(filename, media_type, content, None, DocumentDisposition.inline)

    @staticmethod
    def attachment(filename: str, media_type: str, content: bytes) -> "Document":
        return Document(filename, media_type, content, None, DocumentDisposition.attachment)

    @staticmethod
    def pdf(filename: str, content: bytes) -> "Document":
        """A PDF shown inline — preview it, then print or save it from the viewer."""
        return Document.inline(filename, PDF, content)

    @staticmethod
    def lazy(filename: str, media_type: str, content: Callable[[], bytes]) -> "Document":
        """Bytes produced only when the browser fetches the document (always by URL)."""
        return Document(filename, media_type, None, content, DocumentDisposition.attachment)

    def shown_inline(self) -> "Document":
        return replace(self, disposition=DocumentDisposition.inline)

    def downloaded(self) -> "Document":
        return replace(self, disposition=DocumentDisposition.attachment, print=False)

    def printed(self) -> "Document":
        """Shown and handed to the browser's print dialog at once."""
        return replace(self, disposition=DocumentDisposition.inline, print=True)

    @property
    def produced_on_demand(self) -> bool:
        return self.content is None

    def bytes(self) -> bytes:
        if self.content is not None:
            return self.content
        assert self.lazy_content is not None
        return self.lazy_content()
