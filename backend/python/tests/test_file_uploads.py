"""File uploads through the application's FileStorage (EXPERIMENTAL) — the Python side of
design/uploads/file-uploads-contract.md: the reference value, the ticket the mapper issues, and the
two endpoints (POST /mateu/v3/upload, POST /mateu/v3/upload/target)."""

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.uploads import Uploads, accepts, caller_hash, format_size  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    FileStorage,
    FileUpload,
    Identity,
    IncomingFile,
    ReadOnly,
    StoredFile,
    UploadTarget,
    title,
    ui,
)


@ui("uploads-form")
@title("Uploads")
class UploadsForm:
    contract: Annotated[str | None, FileUpload(accept=".pdf,image/*", max_bytes=20)] = None
    photos: Annotated[list[str], FileUpload()] = []
    locked: Annotated[str | None, FileUpload(), ReadOnly()] = None
    archive: Annotated[str | None, FileUpload(storage="archive")] = None
    inline: Annotated[str | None, FileUpload(accept=".csv", storage=FileUpload.INLINE)] = None


class MemoryStorage(FileStorage):
    def __init__(self):
        self.files: dict[str, tuple[IncomingFile, bytes]] = {}

    async def store(self, file: IncomingFile, request) -> StoredFile:
        data = await file.read()
        file_id = f"f{len(self.files) + 1}"
        self.files[file_id] = (file, data)
        return StoredFile(id=file_id, name=file.name, content_type=file.content_type, size=len(data),
                          url=f"https://files.example.com/{file_id}")


class BrokenStorage(FileStorage):
    async def store(self, file, request):
        raise RuntimeError("disk on fire")


class DirectStorage(MemoryStorage):
    direct_uploads = True

    async def upload_target(self, upload, request):
        return UploadTarget(
            url="https://bucket.example.com/put/1",
            file=StoredFile(id="d1", name=upload.name, content_type=upload.content_type, size=upload.size),
            headers={"x-amz-acl": "private"},
        )


def _walk(node):
    if not isinstance(node, dict):
        return
    yield node
    meta = node.get("metadata")
    if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
        yield from _walk(meta["content"])
    for child in node.get("children") or []:
        yield from _walk(child)


def _attributes(component: dict, field_id: str) -> dict[str, str]:
    meta = next(
        c["metadata"] for c in _walk(component)
        if isinstance(c.get("metadata"), dict) and c["metadata"].get("type") == "FormField"
        and c["metadata"]["fieldId"] == field_id
    )
    return {a["key"]: a["value"] for a in meta["attributes"]}


def _app(*storages, identity=None):
    app = FastAPI()
    holder = {"identity": identity}
    add_mateu(app, UploadsForm, file_storages=list(storages), uploads_secret="test-secret",
              identity_provider=lambda: holder["identity"])
    return TestClient(app), holder


def _form(client) -> dict:
    res = client.post("/mateu/v3/sync/uploads-form", json={"route": "uploads-form", "actionId": ""})
    assert res.status_code == 200
    return res.json()["fragments"][0]["component"]


def _post(client, ticket, data=b"%PDF-1.4", name="contract.pdf", content_type="application/pdf"):
    headers = {"Content-Type": content_type, "X-Mateu-File-Name": name}
    if ticket is not None:
        headers["X-Mateu-Upload-Ticket"] = ticket
    return client.post("/mateu/v3/upload", content=data, headers=headers)


# ── the value ───────────────────────────────────────────────────────────────────
def test_the_reference_value_round_trips_spaces_unicode_and_plus():
    f = StoredFile(id="a b+c/ñ", name="Informe 2026 + anexo ñ.pdf", content_type="application/pdf",
                   size=1234, url="https://x.example.com/a?b=1&c=2")
    value = f.to_value()
    assert value == (
        "mateu-file:a%20b%2Bc%2F%C3%B1?name=Informe%202026%20%2B%20anexo%20%C3%B1.pdf"
        "&type=application%2Fpdf&size=1234&url=https%3A%2F%2Fx.example.com%2Fa%3Fb%3D1%26c%3D2"
    )
    assert StoredFile.parse(value) == f
    # '+' is a literal plus, absent params are omitted, size unknown = -1
    assert StoredFile.parse("mateu-file:x?name=a+b") == StoredFile(id="x", name="a+b")
    assert StoredFile(id="x").to_value() == "mateu-file:x"
    assert StoredFile.parse("data:text/plain;base64,AA==") is None
    assert StoredFile.parse(None) is None


def test_sizes_accept_rule_and_caller_hash():
    assert format_size(512) == "512 bytes"
    assert format_size(20 * 1024 * 1024) == "20 MB"
    assert format_size(1536) == "1.5 KB"
    assert format_size(3 * 1024 ** 3) == "3 GB"
    assert accepts(".PDF", "a.pdf", "x/y")
    assert accepts("image/*", "a", "image/png; q=1")
    assert accepts("application/pdf", "a", "Application/PDF")
    assert not accepts(".pdf,image/*", "a.txt", "text/plain")
    assert accepts("", "a", "b")
    assert caller_hash(Identity(roles=("b", "a"), name="u")) == caller_hash(Identity(roles=("a", "b"), name="u"))
    assert caller_hash(None) != caller_hash(Identity(name="u"))


# ── the ticket the mapper issues ────────────────────────────────────────────────
def test_no_store_means_no_ticket_attributes():
    component = SyncHandler(MateuRegistry(UploadsForm)).handle(
        RunActionRq(server_side_type=type_name(UploadsForm))
    ).model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    assert _attributes(component, "contract") == {"accept": ".pdf,image/*", "maxBytes": "20"}
    assert _attributes(component, "photos") == {"multiple": "true"}
    assert _attributes(component, "archive") == {"storage": "archive"}


def test_a_ticket_is_issued_only_with_a_store_and_never_on_a_read_only_field():
    client, _ = _app(MemoryStorage())
    component = _form(client)
    contract = _attributes(component, "contract")
    assert contract["uploadUrl"] == "/mateu/v3/upload"
    assert contract["uploadTicket"]
    assert "uploadDirect" not in contract
    assert "uploadTicket" in _attributes(component, "photos")
    assert "uploadTicket" not in _attributes(component, "locked")
    # a store named "archive" is not registered: no ticket for that field
    assert "uploadTicket" not in _attributes(component, "archive")


def test_a_direct_store_says_so():
    client, _ = _app(DirectStorage())
    assert _attributes(_form(client), "contract")["uploadDirect"] == "true"


# ── POST /mateu/v3/upload ───────────────────────────────────────────────────────
def test_an_upload_streams_into_the_store_and_answers_the_reference():
    store = MemoryStorage()
    client, _ = _app(store)
    ticket = _attributes(_form(client), "photos")["uploadTicket"]
    res = _post(client, ticket, data=b"hello world", name="Mi%20foto%20%C3%B1.png", content_type="image/png")
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["file"] == {"id": "f1", "name": "Mi foto ñ.png", "contentType": "image/png", "size": 11,
                            "url": "https://files.example.com/f1"}
    assert StoredFile.parse(body["value"]).name == "Mi foto ñ.png"
    incoming, data = store.files["f1"]
    assert data == b"hello world" and incoming.size == 11


def test_a_missing_or_forged_ticket_is_403():
    client, _ = _app(MemoryStorage())
    ticket = _attributes(_form(client), "contract")["uploadTicket"]
    for bad in (None, "", "garbage", ticket[:-2] + ("AA" if not ticket.endswith("AA") else "BB")):
        res = _post(client, bad)
        assert res.status_code == 403
        assert res.json() == {"error": "Forbidden", "message": "This upload is not allowed."}
    # another backend's ticket (another secret) is forged too
    other = Uploads([MemoryStorage()], secret="another").issue("", "contract", 20, ".pdf", False, None)
    assert _post(client, other).status_code == 403


def test_a_ticket_belongs_to_its_caller():
    client, holder = _app(MemoryStorage(), identity=Identity(name="ana"))
    ticket = _attributes(_form(client), "photos")["uploadTicket"]
    holder["identity"] = Identity(name="bob")
    assert _post(client, ticket, content_type="image/png").status_code == 403
    holder["identity"] = Identity(name="ana")
    assert _post(client, ticket, content_type="image/png").status_code == 200


def test_over_the_limit_is_413_and_not_accepted_is_415():
    client, _ = _app(MemoryStorage())
    ticket = _attributes(_form(client), "contract")["uploadTicket"]
    res = _post(client, ticket, data=b"x" * 21)
    assert res.status_code == 413
    assert res.json() == {"error": "Too large", "message": "This file is too large (max 20 bytes)."}
    res = _post(client, ticket, data=b"x", name="notes.txt", content_type="text/plain")
    assert res.status_code == 415
    assert res.json() == {"error": "Not accepted", "message": "This type of file is not accepted."}
    assert _post(client, ticket, data=b"x" * 20).status_code == 200


def test_over_the_limit_while_streaming_is_413():
    client, _ = _app(MemoryStorage())
    ticket = _attributes(_form(client), "contract")["uploadTicket"]

    def chunks():
        for _ in range(5):
            yield b"12345678"

    res = client.post("/mateu/v3/upload", content=chunks(), headers={
        "Content-Type": "application/pdf", "X-Mateu-File-Name": "a.pdf", "X-Mateu-Upload-Ticket": ticket,
    })
    assert res.status_code == 413


def test_a_store_failure_goes_through_the_error_boundary():
    client, _ = _app(BrokenStorage())
    ticket = _attributes(_form(client), "contract")["uploadTicket"]
    res = _post(client, ticket)
    assert res.status_code == 500
    body = res.json()
    assert body["error"] == "Something went wrong"
    assert body["message"].startswith("An unexpected error occurred. Reference: ")
    assert "disk on fire" not in res.text


def test_a_store_no_longer_registered_is_404():
    client, _ = _app(MemoryStorage())
    other = Uploads([], secret="test-secret").issue("gone", "contract", 20, "", False, None)
    res = _post(client, other)
    assert res.status_code == 404
    assert res.json() == {"error": "Not found", "message": "Uploads are not available."}


def test_the_upload_endpoint_takes_raw_bytes_not_json():
    # the JSON-body guard of the sync endpoint does not apply to the upload endpoint
    client, _ = _app(MemoryStorage())
    ticket = _attributes(_form(client), "photos")["uploadTicket"]
    assert _post(client, ticket, content_type="application/octet-stream").status_code == 200
    assert client.post("/mateu/v3/sync/uploads-form", content=b"x",
                       headers={"Content-Type": "application/octet-stream"}).status_code == 415


# ── POST /mateu/v3/upload/target ────────────────────────────────────────────────
def test_a_direct_store_issues_a_target():
    client, _ = _app(DirectStorage())
    ticket = _attributes(_form(client), "contract")["uploadTicket"]
    res = client.post("/mateu/v3/upload/target", json={"name": "a.pdf", "contentType": "application/pdf", "size": 10},
                      headers={"X-Mateu-Upload-Ticket": ticket})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["url"] == "https://bucket.example.com/put/1"
    assert body["method"] == "PUT"
    assert body["headers"] == {"x-amz-acl": "private"}
    assert body["value"] == "mateu-file:d1?name=a.pdf&type=application%2Fpdf&size=10"
    assert body["file"]["id"] == "d1"
    too_big = client.post("/mateu/v3/upload/target", json={"name": "a.pdf", "contentType": "application/pdf",
                                                           "size": 21}, headers={"X-Mateu-Upload-Ticket": ticket})
    assert too_big.status_code == 413
    assert client.post("/mateu/v3/upload/target", json={"name": "a.pdf"}).status_code == 403


def test_a_streaming_store_issues_no_target():
    client, _ = _app(MemoryStorage())
    ticket = _attributes(_form(client), "contract")["uploadTicket"]
    res = client.post("/mateu/v3/upload/target", json={"name": "a.pdf", "contentType": "application/pdf", "size": 1},
                      headers={"X-Mateu-Upload-Ticket": ticket})
    assert res.status_code == 404
    assert "error" in res.json()


def test_a_store_among_the_sources_is_discovered():
    registry = MateuRegistry(UploadsForm, MemoryStorage)
    assert [type(s) for s in registry.file_storages] == [MemoryStorage]


# ── the reserved "inline" storage ───────────────────────────────────────────────
def test_an_inline_field_never_gets_a_ticket_even_with_a_store():
    assert FileUpload.INLINE == "inline"
    client, _ = _app(MemoryStorage())
    assert _attributes(_form(client), "inline") == {"accept": ".csv", "storage": "inline"}


def test_the_import_wizard_csv_field_keeps_its_data_uri():
    from mateu_ui.core.importwizard import ImportWizard

    class Row:
        code: str = ""

    @ui("uploads-import")
    class RowImport(ImportWizard[Row]):
        def import_rows(self, rows):
            pass

    app = FastAPI()
    add_mateu(app, RowImport, file_storages=[MemoryStorage()], uploads_secret="test-secret")
    client = TestClient(app)
    res = client.post("/mateu/v3/sync/uploads-import", json={"route": "uploads-import", "actionId": ""})
    assert res.status_code == 200
    attributes = _attributes(res.json()["fragments"][0]["component"], "file")
    assert attributes["storage"] == "inline"
    assert "uploadTicket" not in attributes and "uploadUrl" not in attributes


def test_an_invalid_target_body_is_400():
    client, _ = _app(DirectStorage())
    ticket = _attributes(_form(client), "contract")["uploadTicket"]
    res = client.post("/mateu/v3/upload/target", content=b"{nope", headers={
        "X-Mateu-Upload-Ticket": ticket, "Content-Type": "application/json"})
    assert res.status_code == 400
    assert res.json() == {"error": "Bad request", "message": "The upload request is not valid JSON."}
