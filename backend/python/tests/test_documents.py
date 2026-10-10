"""Actions that return documents — the Python mirror of Java's ``DocumentsSyncTest``: a small
document travels base64 in the response, a large or lazy one behind a single-use URL under the
mount, and the endpoint serves it once with safe headers."""

import base64
import re
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, documents, type_name  # noqa: E402
from mateu_dtos import UICommand  # noqa: E402
from mateu_uidl import (  # noqa: E402
    ComponentTreeSupplier,
    Document,
    DocumentDisposition,
    Message,
    action,
    title,
    ui,
)
from mateu_uidl import components as fluent  # noqa: E402

SMALL = b"%PDF-1.4 small"
LARGE = bytes(400 * 1024)
calls = {"lazy": 0}


def _lazy() -> bytes:
    calls["lazy"] += 1
    return SMALL


@ui("documents")
@title("Documents")
class DocumentsView(ComponentTreeSupplier):
    def component(self):
        return fluent.Text(text="Documents")

    @action
    def preview(self) -> Document:
        return Document.pdf("folio.pdf", SMALL)

    @action
    def download(self) -> Document:
        return Document.attachment("export.csv", "text/csv", b"a;b")

    @action
    def big(self) -> Document:
        return Document.pdf("report.pdf", LARGE)

    @action
    def lazy_one(self) -> Document:
        return Document.lazy("lazy.pdf", "application/pdf", _lazy)

    @action
    def print_folio(self) -> Document:
        return Document.pdf("folio.pdf", SMALL).printed()

    @action
    def with_message(self):
        return [Message("Invoice ready"), Document.pdf("invoice.pdf", SMALL)]

    @action
    def print_page(self) -> UICommand:
        return UICommand.print()


MODULE = sys.modules[__name__]


def run(action_id: str):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route="documents", action_id=action_id, server_side_type=type_name(DocumentsView),
        initiator_component_id="cmp-1",
    ))


def the_download(inc) -> dict:
    wire = inc.model_dump(by_alias=True, mode="json")
    found = [c for c in wire["commands"] if c["type"] == "DownloadFile"]
    assert len(found) == 1
    assert found[0]["targetComponentId"] == "cmp-1"
    return found[0]["data"]


def test_a_small_inline_pdf_travels_base64_in_the_response():
    inc = run("preview")
    file = the_download(inc)
    assert file["filename"] == "folio.pdf"
    assert file["mimeType"] == "application/pdf"
    assert file["disposition"] == "inline"
    assert file["print"] is False
    assert file["url"] is None
    assert base64.b64decode(file["base64Content"]) == SMALL
    assert inc.fragments == []


def test_an_attachment_is_downloaded():
    file = the_download(run("download"))
    assert file["disposition"] == "attachment"
    assert file["mimeType"] == "text/csv"


def test_a_large_document_travels_behind_a_single_use_url():
    file = the_download(run("big"))
    assert file["base64Content"] is None
    assert file["url"].startswith("/mateu/v3/documents/")
    token = file["url"].rsplit("/", 1)[1]
    first = documents.serve(token)
    assert first.status == 200
    assert first.body == LARGE
    assert first.headers["Content-Disposition"] == "inline; filename=\"report.pdf\"; filename*=UTF-8''report.pdf"
    assert first.headers["Cache-Control"] == "no-store"
    assert first.headers["X-Content-Type-Options"] == "nosniff"
    assert documents.serve(token).status == 404


def test_a_lazy_document_is_produced_only_when_fetched():
    calls["lazy"] = 0
    file = the_download(run("lazyOne"))
    assert calls["lazy"] == 0
    assert documents.serve(file["url"].rsplit("/", 1)[1]).body == SMALL
    assert calls["lazy"] == 1


def test_a_printed_document_and_the_print_command():
    file = the_download(run("printFolio"))
    assert file["disposition"] == "inline" and file["print"] is True
    inc = run("withMessage")
    assert the_download(inc)["filename"] == "invoice.pdf"
    assert len(inc.messages) == 1
    assert any(c.type == "Print" and c.data is None for c in run("printPage").commands)


def test_tokens_expire_and_the_store_is_bounded():
    now = [1000.0]
    store = documents.DocumentStore(30, clock=lambda: now[0])
    token = store.park(Document.pdf("a.pdf", b"x"))
    now[0] += 31
    assert documents.serve(token, store).status == 404

    bounded = documents.DocumentStore()
    first = bounded.park(Document.pdf("first.pdf", b"x"))
    for i in range(documents.MAX_ENTRIES):
        bounded.park(Document.pdf(f"{i}.pdf", b"x"))
    assert len(bounded) == documents.MAX_ENTRIES
    assert bounded.take(first) is None
    assert documents.serve("../../etc/passwd").status == 404


def test_content_disposition_and_media_type_are_safe():
    assert documents.content_disposition(DocumentDisposition.attachment, "Factura ñ €.pdf") == (
        "attachment; filename=\"Factura _ _.pdf\"; filename*=UTF-8''Factura%20%C3%B1%20%E2%82%AC.pdf"
    )
    hostile = documents.content_disposition(DocumentDisposition.inline, 'a\r\nSet-Cookie: x=1"; b=\\..\\x.pdf')
    assert "\r" not in hostile and "\n" not in hostile
    assert hostile.startswith('inline; filename="a__Set-Cookie: x=1_; b=_.._x.pdf";')
    assert documents.safe_filename("../../etc/passwd") == "_.._etc_passwd"
    assert documents.safe_filename("a‮gpj.exe") == "a_gpj.exe"
    assert documents.safe_media_type("text/html\r\nX: 1") == "application/octet-stream"
    assert documents.safe_media_type("text/csv; charset=utf-8") == "text/csv; charset=utf-8"
    store = documents.DocumentStore()
    html = store.park(Document.inline("x.html", "text/html", b"<p>"))
    assert documents.serve(html, store).headers["Content-Security-Policy"] == "sandbox"


def test_document_rules():
    with pytest.raises(ValueError):
        Document("x")
    d = Document("x", "", b"1", print=True)
    assert d.media_type == "application/octet-stream"
    assert d.print is False
    assert d.shown_inline().disposition is DocumentDisposition.inline
    assert Document.pdf("x", b"1").printed().downloaded().print is False


def test_the_fastapi_mount_serves_a_parked_document_once():
    import fastapi
    from fastapi.testclient import TestClient

    from mateu_fastapi import add_mateu

    app = fastapi.FastAPI()
    add_mateu(app, MODULE, base_url="/hotel")
    client = TestClient(app)
    response = client.post("/hotel/mateu/v3/sync/documents", json={
        "route": "documents", "actionId": "big", "serverSideType": type_name(DocumentsView),
        "initiatorComponentId": "cmp-1",
    })
    url = re.search(r'"url":"([^"]+)"', response.text).group(1)
    assert url.startswith("http://testserver/hotel/mateu/v3/documents/")
    first = client.get(url)
    assert first.status_code == 200
    assert first.headers["content-type"] == "application/pdf"
    assert first.headers["content-disposition"].startswith("inline; filename=\"report.pdf\"")
    assert first.headers["cache-control"] == "no-store"
    assert len(first.content) == len(LARGE)
    assert client.get(url).status_code == 404
