"""ASP.NET-style ``add_mateu`` — wires the ``POST /mateu/v3/sync/{route}`` endpoint onto a FastAPI app.

Per request the adapter

1. binds the request (headers, base url, a correlation id) as the request in flight
   (``mateu_core.request_context``), so the parameterless identity/secrets providers can read it;
2. runs the (synchronous) handler in Starlette's THREADPOOL — the handler reflects, maps and may
   fetch a proxied upstream over HTTP, and running that on the event loop would freeze every other
   request until the slowest upstream answered;
3. answers any unhandled exception with an error-message increment (``mateu_core.errors``) instead
   of a raw 500, logging the traceback under the correlation id.
"""

from __future__ import annotations

import logging
from collections.abc import Callable, Sequence
from types import ModuleType
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

from mateu_core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler
from mateu_core.errors import dev_mode_from_env, error_increment, new_correlation_id
from mateu_core.identity import jwt_identity_provider
from mateu_core.mcp import handle_jsonrpc
from mateu_core.request_context import MateuRequest, bound_request, normalise_headers
from mateu_uidl import Identity

log = logging.getLogger("mateu.fastapi")

#: Response header carrying the request's correlation id (also in the error toast and the log).
CORRELATION_HEADER = "X-Mateu-Correlation-Id"

_FORBIDDEN_BODY = {
    "messages": [
        {"variant": "error", "position": "middle", "title": "", "text": "Forbidden", "duration": 5000}
    ]
}


def add_mateu(
    app: FastAPI,
    *sources: ModuleType | type,
    translator=None,
    base_url: str = "",
    cors_origins: Sequence[str] | None = None,
    cors: bool | None = None,
    identity_provider: Callable[[], Identity | None] | None = None,
    secrets_provider: Callable[[str], str | None] | None = None,
    dev: bool | None = None,
    proxy_timeout_seconds: float = 30.0,
) -> SyncHandler:
    """Register the Mateu endpoints, discovering ``@app``/``@ui`` views in ``sources``.

    - ``cors_origins`` — CORS is OFF unless you list the origins allowed to call the API
      (``["https://app.example.com"]``; ``["*"]`` only if you really mean every origin). A renderer
      served by the same app needs no CORS at all. (Breaking: CORS used to default to ``*``.)
    - ``identity_provider`` — parameterless; returns the caller's ``Identity`` (roles, groups,
      scopes, permissions) that ``EyesOnly``/``ReadOnlyUnless``/``DisabledUnless`` match against.
      Read the request in flight with ``mateu_core.request_context.current_request()`` /
      ``bearer_token()``. Default: ``jwt_identity_provider()`` — the Bearer JWT's claims, read
      UNVERIFIED like Java's ``Authorizer`` (put a verifier in front, or pass
      ``jwt_identity_provider(key=...)`` to verify here). Requires the ``jwt`` extra.
    - ``secrets_provider`` — ``key -> value`` for ``${secret.KEY}`` in proxied REST sources; None →
      the same-named environment variable.
    - ``dev`` — show exception details in error toasts (default: ``MATEU_DEV`` env var). Off in
      production: users then see a generic text with a correlation id, the detail goes to the log.

    Returns the ``SyncHandler`` (useful in tests).
    """
    if cors and not cors_origins:
        raise ValueError(
            "add_mateu(cors=True) no longer allows every origin: pass the allowed origins "
            "explicitly, e.g. add_mateu(app, ..., cors_origins=['https://app.example.com'])"
        )
    registry = MateuRegistry(*sources)
    handler = SyncHandler(
        registry,
        translator,
        identity_provider=identity_provider if identity_provider is not None else jwt_identity_provider(),
        secrets_provider=secrets_provider,
        proxy_timeout_seconds=proxy_timeout_seconds,
    )
    show_details = dev_mode_from_env() if dev is None else dev

    if cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(cors_origins),
            allow_methods=["POST", "OPTIONS"],
            allow_headers=["*"],
            expose_headers=[CORRELATION_HEADER],
        )

    prefix = base_url.rstrip("/")

    def request_of(request: Request) -> MateuRequest:
        request_base_url = str(request.base_url).rstrip("/") + (
            f"/{base_url.strip('/')}" if base_url else ""
        )
        return MateuRequest(
            headers=normalise_headers(request.headers.items()),
            base_url=request_base_url,
            correlation_id=new_correlation_id(),
        )

    def run_bound(mateu_request: MateuRequest, fn: Callable[[], Any]) -> Any:
        # Runs in a worker thread: bind the request HERE so the ContextVar is set in the thread
        # that runs the handler, whatever the threadpool does with the caller's context.
        with bound_request(mateu_request):
            return fn()

    def failed(error: Exception, mateu_request: MateuRequest) -> JSONResponse:
        cid = mateu_request.correlation_id or new_correlation_id()
        log.exception("Unhandled error answering a Mateu request [correlation id %s]", cid, exc_info=error)
        increment = error_increment(error, cid, show_details)
        return JSONResponse(
            increment.model_dump(by_alias=True, mode="json"), headers={CORRELATION_HEADER: cid}
        )

    async def sync(request: Request, route: str = "") -> JSONResponse:
        mateu_request = request_of(request)
        try:
            body = await request.body()
            rq = RunActionRq.model_validate_json(body) if body else RunActionRq()
            if not rq.route:
                rq.route = route
            increment = await run_in_threadpool(
                run_bound, mateu_request, lambda: handler.handle(rq, mateu_request.base_url)
            )
        except MateuForbiddenException:
            # A denied action (disabled_unless/audience not satisfied at invocation): 403 with a
            # generic error message; the reason was logged by the guard and the method never ran.
            return JSONResponse(status_code=403, content=_FORBIDDEN_BODY)
        except Exception as error:  # noqa: BLE001 - the error boundary: never a raw 500
            return failed(error, mateu_request)
        return JSONResponse(
            increment.model_dump(by_alias=True, mode="json"),
            headers={CORRELATION_HEADER: mateu_request.correlation_id or ""},
        )

    app.add_api_route(f"{prefix}/mateu/v3/sync/{{route:path}}", sync, methods=["POST"])
    app.add_api_route(f"{prefix}/mateu/v3/sync", sync, methods=["POST"])

    # Native MCP endpoint — the app is also an MCP (the agent-operability plane). A JSON-RPC 2.0
    # message in, the projected wire out; reuses the SyncHandler so RBAC applies as on sync.
    async def mcp(request: Request) -> JSONResponse:
        mateu_request = request_of(request)
        message = await request.json()

        def sync_fn(route, action_id, component_state, parameters):
            rq = RunActionRq(
                route=route or "",
                action_id=action_id or "",
                component_state=component_state or {},
                parameters=parameters or {},
            )
            return handler.handle(rq, mateu_request.base_url).model_dump(by_alias=True, mode="json")

        try:
            response = await run_in_threadpool(
                run_bound, mateu_request, lambda: handle_jsonrpc(message, sync_fn)
            )
        except Exception as error:  # noqa: BLE001
            return failed(error, mateu_request)
        if response is None:
            return JSONResponse(status_code=202, content=None)
        return JSONResponse(response)

    app.add_api_route(f"{prefix}/mateu/mcp", mcp, methods=["POST"])
    return handler


__all__ = ["CORRELATION_HEADER", "add_mateu"]
