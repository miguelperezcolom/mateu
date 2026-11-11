"""``POST /mateu/v3/upload`` and ``POST /mateu/v3/upload/target`` (EXPERIMENTAL) — file uploads
through the application's ``FileStorage`` (contract: design/uploads/file-uploads-contract.md §4).

The body of an upload is the RAW bytes (not multipart), streamed into ``FileStorage.store`` through
a limiting iterator: a file over the ticket's limit aborts with 413. The ticket header is required
(its absence is 403): being a custom header it also forces a CORS preflight, which is what makes
the endpoint CSRF-safe without a JSON body — so it is deliberately NOT behind the JSON-body guard.
"""

from __future__ import annotations

import inspect
import json
from collections.abc import Callable

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from mateu_ui.core import error_boundary
from mateu_ui.core.request_context import MateuRequest, bound_request
from mateu_ui.core.uploads import (
    FILE_NAME_HEADER,
    TARGET_PATH,
    TICKET_HEADER,
    UPLOAD_PATH,
    Uploads,
    accepts,
    format_size,
)
from mateu_ui.uidl.uploads import IncomingFile, StoredFile, UploadRequest, UploadTarget, decode_component

CORRELATION_HEADER = "X-Mateu-Correlation-Id"


class _TooLarge(Exception):
    """The body went past the ticket's limit while streaming."""


def _error(status: int, title: str, message: str, cid: str | None = None) -> JSONResponse:
    headers = {CORRELATION_HEADER: cid} if cid else None
    return JSONResponse(status_code=status, content={"error": title, "message": message}, headers=headers)


def _forbidden() -> JSONResponse:
    return _error(403, "Forbidden", "This upload is not allowed.")


def _not_found() -> JSONResponse:
    return _error(404, "Not found", "Uploads are not available.")


def _too_large(max_bytes: int) -> JSONResponse:
    return _error(413, "Too large", f"This file is too large (max {format_size(max_bytes)}).")


def _not_accepted() -> JSONResponse:
    return _error(415, "Not accepted", "This type of file is not accepted.")


def _caused_by_too_large(error: BaseException) -> bool:
    seen: set[int] = set()
    e: BaseException | None = error
    while e is not None and id(e) not in seen:
        if isinstance(e, _TooLarge):
            return True
        seen.add(id(e))
        e = e.__cause__ or e.__context__
    return False


def _content_length(request: Request) -> int:
    raw = request.headers.get("content-length")
    try:
        return int(raw) if raw is not None and raw.strip() else -1
    except ValueError:
        return -1


async def _awaited(value):
    return await value if inspect.isawaitable(value) else value


def add_upload_endpoints(
    app: FastAPI,
    uploads_of: Callable[[], Uploads],
    request_of: Callable[[Request], MateuRequest],
    identity_of: Callable[[], object],
    show_details: bool,
) -> None:
    """Registers both endpoints at the ROOT path (the ``uploadUrl`` the fields carry)."""

    def verified(request: Request, mateu_request: MateuRequest):
        """(uploads, ticket claims, store) or the refusal to answer."""
        uploads = uploads_of()
        ticket = request.headers.get(TICKET_HEADER)
        with bound_request(mateu_request):
            identity = identity_of()
        claims = uploads.verify(ticket, identity)
        if claims is None:
            return None, _forbidden()
        store = uploads.store_for(claims.storage)
        if store is None:
            return None, _not_found()
        return (claims, store), None

    def failed(error: Exception, mateu_request: MateuRequest) -> JSONResponse:
        cid = mateu_request.correlation_id
        described = error_boundary.describe(error, "upload", show_details or None, cid)
        return _error(500, described["title"], described["text"], cid)

    async def upload(request: Request):
        mateu_request = request_of(request)
        ok, refusal = verified(request, mateu_request)
        if refusal is not None:
            return refusal
        claims, store = ok
        name = decode_component(request.headers.get(FILE_NAME_HEADER) or "")
        content_type = (request.headers.get("content-type") or "").strip() or "application/octet-stream"
        if not accepts(claims.accept, name, content_type):
            return _not_accepted()
        declared = _content_length(request)
        if declared > claims.max_bytes:
            return _too_large(claims.max_bytes)
        received = 0

        async def limited():
            nonlocal received
            async for chunk in request.stream():
                if not chunk:
                    continue
                received += len(chunk)
                if received > claims.max_bytes:
                    raise _TooLarge()
                yield chunk

        incoming = IncomingFile(name=name, content_type=content_type, size=declared, content=limited())
        try:
            with bound_request(mateu_request):
                stored = await _awaited(store.store(incoming, mateu_request))
        except Exception as error:  # noqa: BLE001 - the error boundary: never a raw 500
            if _caused_by_too_large(error):
                return _too_large(claims.max_bytes)
            return failed(error, mateu_request)
        if not isinstance(stored, StoredFile):
            return failed(TypeError("FileStorage.store must return a StoredFile"), mateu_request)
        if stored.size is None or stored.size < 0:
            # the store did not count: the bytes it read are the size
            stored = StoredFile(stored.id, stored.name, stored.content_type, received, stored.url)
        return JSONResponse({"value": stored.to_value(), "file": stored.to_json()})

    async def target(request: Request):
        mateu_request = request_of(request)
        ok, refusal = verified(request, mateu_request)
        if refusal is not None:
            return refusal
        claims, store = ok
        try:
            body = json.loads(await request.body() or b"{}")
            if not isinstance(body, dict):
                raise ValueError("not an object")
        except ValueError:
            return _error(400, "Bad request", "The upload request is not valid JSON.")
        name = str(body.get("name") or "")
        content_type = str(body.get("contentType") or "").strip() or "application/octet-stream"
        try:
            size = int(body.get("size")) if body.get("size") is not None else -1
        except (TypeError, ValueError):
            size = -1
        if not accepts(claims.accept, name, content_type):
            return _not_accepted()
        if size > claims.max_bytes:
            return _too_large(claims.max_bytes)
        if not getattr(store, "direct_uploads", False):
            return _not_found()
        try:
            with bound_request(mateu_request):
                issued = await _awaited(
                    store.upload_target(UploadRequest(name=name, content_type=content_type, size=size), mateu_request)
                )
        except Exception as error:  # noqa: BLE001 - the error boundary: never a raw 500
            return failed(error, mateu_request)
        if not isinstance(issued, UploadTarget):
            return _not_found()
        return JSONResponse({
            "url": issued.url,
            "method": issued.method or "PUT",
            "headers": dict(issued.headers or {}),
            "value": issued.file.to_value(),
            "file": issued.file.to_json(),
        })

    app.add_api_route(UPLOAD_PATH, upload, methods=["POST"])
    app.add_api_route(TARGET_PATH, target, methods=["POST"])


__all__ = ["add_upload_endpoints"]
