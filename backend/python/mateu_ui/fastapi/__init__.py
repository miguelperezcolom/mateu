"""ASP.NET-style ``add_mateu`` — wires the ``POST /mateu/v3/sync/{route}`` endpoint onto a FastAPI app.

Per request the adapter

1. binds the request (headers, base url, a correlation id) as the request in flight
   (``mateu_ui.core.request_context``), so the parameterless identity/secrets providers can read it;
2. runs the (synchronous) handler in Starlette's THREADPOOL — the handler reflects, maps and may
   fetch a proxied upstream over HTTP, and running that on the event loop would freeze every other
   request until the slowest upstream answered;
3. answers any unhandled exception with an error-message increment (``mateu_ui.core.errors``) instead
   of a raw 500, logging the traceback under the correlation id.
"""

from __future__ import annotations

import asyncio
import logging
import os
from collections.abc import Callable, Sequence
from types import ModuleType
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, StreamingResponse
from starlette.concurrency import run_in_threadpool

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler
from mateu_ui.core.errors import dev_mode_from_env, error_increment, new_correlation_id
from mateu_ui.core.identity import framework_identity_provider, warn_on_startup
from mateu_ui.core import agent_push, dev_specs, documents, mobile_manifest, ui_page
from mateu_ui.core.naming import humanize
from mateu_ui.core.mcp import handle_jsonrpc
from mateu_ui.core.request_context import MateuRequest, bound_request, normalise_headers
from mateu_ui.uidl import Identity, UserFacingException

log = logging.getLogger("mateu.fastapi")

#: The live-updates event stream (``_live-updates``): an empty heartbeat this often, and the stream
#: closes after LIVE_MAX_SECONDS so a subscription nobody reads cannot live forever — the browser
#: reconnects at once (mirrors Java's LiveUpdatesActionRunner). Module-level so tests can shorten them.
LIVE_HEARTBEAT_SECONDS: float = 20
LIVE_MAX_SECONDS: float = 300

#: Response header carrying the request's correlation id (also in the error toast and the log).
CORRELATION_HEADER = "X-Mateu-Correlation-Id"

_FORBIDDEN_BODY = {
    "messages": [
        {"variant": "error", "position": "middle", "title": "", "text": "Forbidden", "duration": 5000}
    ]
}


#: The (plain text) body of the 415 a non-JSON POST to a Mateu endpoint gets.
_JSON_BODIES_ONLY_MESSAGE = "Mateu endpoints accept only application/json bodies"


def _is_json_content_type(content_type: str | None) -> bool:
    """``application/json`` or any ``application/*+json``, parameters ignored."""
    if not content_type or not content_type.strip():
        return False
    media = content_type.split(";", 1)[0].strip().lower()
    return media == "application/json" or (media.startswith("application/") and media.endswith("+json"))


def _non_json_refusal(request: Request) -> Response | None:
    """The 415 a body NOT declared JSON gets on sync, SSE and MCP: ``text/plain``, the form encodings
    or no Content-Type are exactly what a cross-site page can make the browser send without a CORS
    preflight, with the user's cookies — refusing them keeps a cookie-authenticated app safe from
    cross-site request forgery (Java: ``JsonBodyGuard``; .NET: ``JsonBodiesOnly``)."""
    if _is_json_content_type(request.headers.get("content-type")):
        return None
    return Response(_JSON_BODIES_ONLY_MESSAGE, status_code=415, media_type="text/plain")


def mcp_enabled_from_env() -> bool:
    """``MATEU_MCP_ENABLED`` (true/1/yes) — the native MCP endpoint is OFF unless enabled."""
    return os.environ.get("MATEU_MCP_ENABLED", "").strip().lower() in ("1", "true", "yes")


def mcp_push_enabled_from_env() -> bool:
    """``MATEU_MCP_PUSH_ENABLED`` (true/1/yes) — live UI push is OFF unless enabled (and it needs
    the MCP endpoint too)."""
    return os.environ.get("MATEU_MCP_PUSH_ENABLED", "").strip().lower() in ("1", "true", "yes")


def _int_from_env(name: str, default: int) -> int:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        log.warning("Mateu: %s=%r is not a number; using %d", name, raw, default)
        return default


def authenticated_principal(request: Request) -> Identity | None:
    """The identity the app's own authentication established, or None: an ``Identity`` its
    dependency/middleware put in ``request.state.mateu_identity``, else Starlette's
    ``AuthenticationMiddleware`` (``request.user`` + ``request.auth.scopes``).

    Roles, groups and permissions are read from the user object's ``roles`` / ``groups`` /
    ``permissions`` attributes when it has them, its name from ``username`` / ``display_name``.
    Trusted as is: the app authenticated it."""
    state_identity = getattr(request.state, "mateu_identity", None)
    if isinstance(state_identity, Identity):
        return state_identity
    if "user" not in request.scope:
        return None  # no AuthenticationMiddleware installed
    user = request.scope.get("user")
    if user is None or not getattr(user, "is_authenticated", False):
        return None
    auth = request.scope.get("auth")

    def values(source: Any, name: str) -> tuple[str, ...]:
        raw = getattr(source, name, None) if source is not None else None
        if raw is None:
            return ()
        if isinstance(raw, str):
            return tuple(v for v in raw.split(" ") if v)
        return tuple(str(v) for v in raw)

    return Identity(
        roles=values(user, "roles"),
        groups=values(user, "groups"),
        scopes=values(auth, "scopes"),
        permissions=values(user, "permissions"),
        name=_user_name(user),
    )


def _user_name(user: Any) -> str | None:
    """The authenticated user's name: ``username``, else Starlette's ``display_name``."""
    for attribute in ("username", "display_name"):
        try:
            value = getattr(user, attribute, None)
        except NotImplementedError:  # BaseUser leaves display_name abstract
            value = None
        if isinstance(value, str) and value:
            return value
    return None


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
    environment: str | None = None,
    live_reload: bool | None = None,
    mcp: bool | None = None,
    ui: str | os.PathLike[str] | None = None,
    mcp_push: bool | None = None,
    mcp_push_rate_per_minute: int | None = None,
    mcp_push_max_sessions: int | None = None,
    mcp_push_max_sessions_per_owner: int | None = None,
) -> SyncHandler:
    """Register the Mateu endpoints, discovering ``@app``/``@ui`` views in ``sources``.

    - ``cors_origins`` — CORS is OFF unless you list the origins allowed to call the API
      (``["https://app.example.com"]``; ``["*"]`` only if you really mean every origin). A renderer
      served by the same app needs no CORS at all. (Breaking: CORS used to default to ``*``.)
    - ``identity_provider`` — parameterless; returns the caller's ``Identity`` (roles, groups,
      scopes, permissions) that ``EyesOnly``/``ReadOnlyUnless``/``DisabledUnless`` match against.
      Read the request in flight with ``mateu_ui.core.request_context.current_request()``.
      Default: ``framework_identity_provider()`` — Mateu does NOT authenticate; it takes the
      identity your app established: ``request.state.mateu_identity`` (set by your dependency or
      middleware), else Starlette's ``AuthenticationMiddleware``. A Bearer token is never decoded.
    - ``secrets_provider`` — ``key -> value`` for ``${secret.KEY}`` in proxied REST sources; None →
      the environment variable ``MATEU_SECRET_<KEY>`` (never an arbitrary one).
    - ``environment`` — the deployment environment whose ``type: Environment`` overrides re-point
      the REST sources (default: the ``MATEU_ENVIRONMENT`` variable; neither → as authored).
    - ``dev`` — show exception details in error toasts (default: ``MATEU_DEV`` env var). Off in
      production: users then see a generic text with a correlation id, the detail goes to the log.
    - ``live_reload`` — development mode (default: ``MATEU_DEV`` env var): the specs directory is
      watched, every cache is dropped on change, and ``GET /mateu/dev/events`` (SSE) +
      ``POST /mateu/dev/reload`` are served. Never in a production profile. Pair it with
      ``uvicorn --reload`` for Python changes.
    - ``mcp`` — serve the native MCP endpoint ``POST /mateu/mcp`` (default: the
      ``MATEU_MCP_ENABLED`` env var, else OFF — Java's ``mateu.mcp.enabled``). It gives any caller a
      programmatic way to drive every screen, so the application has to decide to expose it.
    - ``ui`` — serve a web renderer's page too, like a Java app does: the ``static/`` folder of the
      ``io.mateu:mateu-vaadin`` (or ``mateu-redwood``) jar, or the jar itself (default: the
      ``MATEU_UI`` env var; neither → the sync API only). The page answers the mount and every deep
      link under it, the renderer's assets are served at the origin root, and nothing under
      ``/mateu`` is ever answered with the page. Your own routes keep winning: the page only answers
      what nothing else did.
    - ``mcp_push`` — live UI push (phase C): an MCP caller sends UI to a UI that is OPEN in a tab
      (the ``mateu_list_sessions`` / ``mateu_pair_session`` / ``mateu_push_ui`` / ``mateu_navigate``
      / ``mateu_dispatch_event`` tools, the ``_agent-*`` app actions). Default: the
      ``MATEU_MCP_PUSH_ENABLED`` env var, else OFF; effective only with ``mcp`` on.
      ``mcp_push_rate_per_minute`` (``MATEU_MCP_PUSH_RATE_PER_MINUTE``, default 30 messages per
      session per rolling minute) and ``mcp_push_max_sessions`` (``MATEU_MCP_PUSH_MAX_SESSIONS``,
      default 1000) bound it, and ``mcp_push_max_sessions_per_owner``
      (``MATEU_MCP_PUSH_MAX_SESSIONS_PER_OWNER``, default 20 per principal name, or per client
      address for an anonymous UI) keeps one caller from filling the registry.

    Returns the ``SyncHandler`` (useful in tests).
    """
    if cors and not cors_origins:
        raise ValueError(
            "add_mateu(cors=True) no longer allows every origin: pass the allowed origins "
            "explicitly, e.g. add_mateu(app, ..., cors_origins=['https://app.example.com'])"
        )
    if identity_provider is None:
        warn_on_startup()
    registry = MateuRegistry(*sources)
    handler = SyncHandler(
        registry,
        translator,
        identity_provider=identity_provider if identity_provider is not None else framework_identity_provider(),
        secrets_provider=secrets_provider,
        proxy_timeout_seconds=proxy_timeout_seconds,
        environment=environment,
    )
    show_details = dev_mode_from_env() if dev is None else dev
    mcp_on = mcp_enabled_from_env() if mcp is None else mcp
    push_on = mcp_push_enabled_from_env() if mcp_push is None else mcp_push
    if push_on and not mcp_on:
        log.warning("Mateu: live UI push needs the MCP endpoint (mcp=True / MATEU_MCP_ENABLED); it stays off")
    sessions = (
        handler.enable_agent_push(
            rate_per_minute=(
                mcp_push_rate_per_minute
                if mcp_push_rate_per_minute is not None
                else _int_from_env("MATEU_MCP_PUSH_RATE_PER_MINUTE", agent_push.DEFAULT_RATE_PER_MINUTE)
            ),
            max_sessions=(
                mcp_push_max_sessions
                if mcp_push_max_sessions is not None
                else _int_from_env("MATEU_MCP_PUSH_MAX_SESSIONS", agent_push.DEFAULT_MAX_SESSIONS)
            ),
            max_sessions_per_owner=(
                mcp_push_max_sessions_per_owner
                if mcp_push_max_sessions_per_owner is not None
                else _int_from_env(
                    "MATEU_MCP_PUSH_MAX_SESSIONS_PER_OWNER", agent_push.DEFAULT_MAX_SESSIONS_PER_OWNER
                )
            ),
        )
        if push_on and mcp_on
        else None
    )

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
        # The MOUNT path, never an absolute origin (Java's controllers pass their relative
        # `baseUrl`): the browser resolves it against the page, so the shell keeps working behind a
        # TLS-terminating or Host-rewriting reverse proxy — an origin built from the request the
        # app SAW (http://internal-host:8000) made the shell load its home from an address the
        # browser cannot reach (mixed content / CORS).
        request_base_url = prefix
        return MateuRequest(
            headers=normalise_headers(request.headers.items()),
            base_url=request_base_url,
            correlation_id=new_correlation_id(),
            principal=authenticated_principal(request),
            client_address=request.client.host if request.client is not None else None,
        )

    def run_bound(mateu_request: MateuRequest, fn: Callable[[], Any]) -> Any:
        # Runs in a worker thread: bind the request HERE so the ContextVar is set in the thread
        # that runs the handler, whatever the threadpool does with the caller's context.
        with bound_request(mateu_request):
            return fn()

    def failed(error: Exception, mateu_request: MateuRequest, action_id: str | None = None) -> JSONResponse:
        # A UserFacingException / validation error shows its message; anything else a generic one
        # with the correlation id as reference, the full exception logged under it (mateu.errors).
        cid = mateu_request.correlation_id or new_correlation_id()
        increment = error_increment(error, cid, show_details, action_id)
        return JSONResponse(
            increment.model_dump(by_alias=True, mode="json"), headers={CORRELATION_HEADER: cid}
        )

    async def sync(request: Request, route: str = "") -> Response:
        refused = _non_json_refusal(request)
        if refused is not None:
            return refused
        mateu_request = request_of(request)
        rq: RunActionRq | None = None
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
            return failed(error, mateu_request, rq.action_id if rq is not None else None)
        return JSONResponse(
            increment.model_dump(by_alias=True, mode="json"),
            headers={CORRELATION_HEADER: mateu_request.correlation_id or ""},
        )

    app.add_api_route(f"{prefix}/mateu/v3/sync/{{route:path}}", sync, methods=["POST"])
    app.add_api_route(f"{prefix}/mateu/v3/sync", sync, methods=["POST"])

    # The documented contract (Java answers every POST v3/<operation>/**): the Redwood renderer
    # calls POST /mateu/v3/components/_/action, and this port answered it 404 — Redwood could not
    # render a Python backend at all. The route travels in the body, never in that path.
    async def component_action(request: Request, rest: str = "") -> Response:
        return await sync(request, "")

    app.add_api_route(
        f"{prefix}/mateu/v3/components/{{rest:path}}", component_action, methods=["POST"]
    )

    # Streamed actions: one text/event-stream "data:" event per increment, at the same
    # /mateu/v3/sse/{route} the Java adapters serve. The app-level `_live-updates` action is the
    # open-ended APP EVENT STREAM of @app(live_updates=True): the last published header values
    # first, then one increment per LiveHeaderValues.publish, an empty heartbeat every
    # LIVE_HEARTBEAT_SECONDS, closing after LIVE_MAX_SECONDS or when the browser goes away. Any
    # other action runs through the sync handler and streams its one increment.
    async def sse(request: Request, route: str = "") -> Response:
        import json as json_module

        from mateu_ui.uidl import LiveHeaderValues

        refused = _non_json_refusal(request)
        if refused is not None:
            return refused
        mateu_request = request_of(request)
        rq: RunActionRq | None = None
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue = asyncio.Queue()

        def enqueue(item) -> None:
            try:
                loop.call_soon_threadsafe(queue.put_nowait, item)
            except RuntimeError:  # the loop is gone: nobody is reading this stream any more
                pass

        # the stream an `_agent-channel` opens: the registry delivers to it from any thread
        channel = agent_push.AgentChannel(
            deliver=lambda data: enqueue(("message", data)), close=lambda: enqueue(("close", None))
        )
        try:
            body = await request.body()
            rq = RunActionRq.model_validate_json(body) if body else RunActionRq()
            if not rq.route:
                rq.route = route
            parsed = rq

            def first_increment():
                if parsed.action_id != agent_push.CHANNEL_ACTION:
                    return handler.handle(parsed, mateu_request.base_url)
                with agent_push.bound_channel(channel):
                    return handler.handle(parsed, mateu_request.base_url)

            first = await run_in_threadpool(run_bound, mateu_request, first_increment)
        except MateuForbiddenException:
            return JSONResponse(status_code=403, content=_FORBIDDEN_BODY)
        except Exception as error:  # noqa: BLE001 - the error boundary: never a raw 500
            failure = failed(error, mateu_request, rq.action_id if rq is not None else None)
            payload = bytes(failure.body).decode()

            async def one_error():
                yield f"data: {payload}\n\n"

            return StreamingResponse(one_error(), media_type="text/event-stream")

        def event(increment) -> str:
            return "data: " + json_module.dumps(increment.model_dump(by_alias=True, mode="json")) + "\n\n"

        headers = {"Cache-Control": "no-cache", CORRELATION_HEADER: mateu_request.correlation_id or ""}
        if rq.action_id == agent_push.CHANNEL_ACTION:
            return StreamingResponse(
                _agent_stream(request, queue, channel, handler, event(first), event),
                media_type="text/event-stream",
                headers=headers,
            )
        if rq.action_id != "_live-updates":

            async def single():
                yield event(first)

            return StreamingResponse(single(), media_type="text/event-stream", headers=headers)

        from mateu_ui.dtos import UICommand, UIIncrement

        def push(change) -> None:
            enqueue(change)

        unsubscribe = LiveHeaderValues.subscribe(push)

        async def stream():
            try:
                yield event(first)
                deadline = loop.time() + LIVE_MAX_SECONDS
                while True:
                    remaining = deadline - loop.time()
                    if remaining <= 0:
                        break
                    try:
                        change = await asyncio.wait_for(
                            queue.get(), timeout=min(LIVE_HEARTBEAT_SECONDS, remaining)
                        )
                        increment = UIIncrement.of(
                            commands=[UICommand.update_header_value(change.id, change.value)]
                        )
                    except asyncio.TimeoutError:
                        increment = UIIncrement.of()
                    if await request.is_disconnected():
                        break
                    yield event(increment)
            finally:
                unsubscribe()

        return StreamingResponse(stream(), media_type="text/event-stream", headers=headers)

    app.add_api_route(f"{prefix}/mateu/v3/sse/{{route:path}}", sse, methods=["POST"])
    app.add_api_route(f"{prefix}/mateu/v3/sse", sse, methods=["POST"])

    # A document an action parked (mateu_ui.core.documents), served ONCE. No auth beyond the token: a
    # new tab or a download link cannot carry a bearer token, and the 256-bit, short-lived,
    # single-use token was only handed out to a user allowed to run the action.
    async def document(token: str) -> Response:
        served = await run_in_threadpool(documents.serve, token)
        return Response(content=served.body, status_code=served.status, headers=served.headers)

    app.add_api_route(f"{prefix}{documents.PATH_MARKER}{{token}}", document, methods=["GET"])

    # The UI manifest the generic Mateu mobile app reads (experimental): public and cacheable — a
    # name, an icon, the wire version and, optionally, which OIDC provider the host app trusts.
    async def manifest() -> Response:
        return Response(
            content=mobile_manifest.manifest_json(registry.app_type),
            status_code=200,
            headers=mobile_manifest.HEADERS,
        )

    app.add_api_route(f"{prefix}{mobile_manifest.PATH}", manifest, methods=["GET"])

    # Native MCP endpoint — the app is also an MCP (the agent-operability plane). A JSON-RPC 2.0
    # message in, the projected wire out; reuses the SyncHandler so RBAC applies as on sync, and the
    # SAME error boundary: a tool call that fails shows the generic text + reference, never the raw
    # exception (which may carry SQL, paths, other users' data). OFF unless enabled.
    async def mcp_endpoint(request: Request) -> Response:
        refused = _non_json_refusal(request)
        if refused is not None:
            return refused
        mateu_request = request_of(request)
        try:
            message = await request.json()
        except ValueError:
            return JSONResponse(
                {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}}
            )

        def sync_fn(route, action_id, component_state, parameters):
            rq = RunActionRq(
                route=route or "",
                action_id=action_id or "",
                component_state=component_state or {},
                parameters=parameters or {},
            )
            try:
                increment = handler.handle(rq, mateu_request.base_url)
            except MateuForbiddenException:
                # a refused request is the tool error "Forbidden" (never the guard's own wording,
                # which names roles and annotations); a FAILING action stays a screen message
                raise UserFacingException("Forbidden") from None
            except Exception as error:  # noqa: BLE001 - the error boundary, as on sync
                cid = mateu_request.correlation_id or new_correlation_id()
                increment = error_increment(error, cid, show_details, rq.action_id)
            return increment.model_dump(by_alias=True, mode="json")

        def respond():
            push = None
            if sessions is not None:
                # who is calling: its principal name, else its agent key (what the sidecar sends)
                provider = handler.mapper.identity_provider
                identity = provider() if provider else None
                caller = agent_push.Caller.of(
                    getattr(identity, "name", None), mateu_request.header(agent_push.AGENT_KEY_HEADER)
                )
                push = agent_push.PushContext(sessions, caller)
            return handle_jsonrpc(message, sync_fn, show_details, push)

        try:
            response = await run_in_threadpool(run_bound, mateu_request, respond)
        except Exception as error:  # noqa: BLE001
            return failed(error, mateu_request)
        if response is None:
            return JSONResponse(status_code=202, content=None)
        return JSONResponse(response)

    if mcp_on:
        app.add_api_route(f"{prefix}/mateu/mcp", mcp_endpoint, methods=["POST"])

    if dev_specs.enabled() if live_reload is None else live_reload:
        dev_specs.enable(True)
        _add_dev_endpoints(app)

    renderer = ui_page.configured_renderer(ui)
    if renderer is not None:
        app_type = registry.app_type
        title = (
            (
                getattr(app_type, "__mateu_app__", None)
                or getattr(app_type, "__mateu_title__", None)
                or humanize(app_type.__name__)
            )
            if app_type is not None
            else "Mateu"
        )
        app.add_middleware(
            MateuUiMiddleware, renderer=renderer, base_url=prefix, title=str(title), debug=show_details
        )
        log.info("Mateu UI: serving %s at %s", renderer.location, prefix or "/")
    else:
        # no renderer: a browser opening the mount gets a hint (still a 404), not a bare JSON 404
        app.add_middleware(MateuApiHintMiddleware, base_url=prefix)
    return handler


#: The agent channel (``_agent-channel``, live UI push): an empty heartbeat this often, and the
#: stream ends after AGENT_MAX_SECONDS (the UI reconnects at once). Module-level so tests can
#: shorten them.
AGENT_HEARTBEAT_SECONDS: float = 20
AGENT_MAX_SECONDS: float = 300


async def _agent_stream(request: Request, queue, channel, handler: SyncHandler, first: str, event):
    """The ``_agent-channel`` stream: the status first, then one increment per message (an
    ``AgentPush`` command), an empty heartbeat every AGENT_HEARTBEAT_SECONDS; ends after
    AGENT_MAX_SECONDS, when a newer channel of the session replaced it or when the UI goes away.
    Whatever ends it, the session counts as disconnected from then on."""
    import asyncio

    from mateu_ui.dtos import UICommand, UIIncrement

    loop = asyncio.get_running_loop()
    try:
        yield first
        deadline = loop.time() + AGENT_MAX_SECONDS
        while True:
            remaining = deadline - loop.time()
            if remaining <= 0:
                break
            try:
                kind, data = await asyncio.wait_for(
                    queue.get(), timeout=min(AGENT_HEARTBEAT_SECONDS, remaining)
                )
                if kind == "close":
                    break
                increment = UIIncrement.of(
                    commands=[UICommand.agent_push(data["kind"], data["event"], data["detail"])]
                )
            except asyncio.TimeoutError:
                increment = UIIncrement.of()
            if await request.is_disconnected():
                break
            yield event(increment)
    finally:
        if handler.agent_push is not None:
            handler.agent_push.channel_closed(channel)


class MateuUiMiddleware:
    """Serves a web renderer's page and assets for whatever the app itself did not answer — the
    ASGI twin of Java's index controller + ``SpaRedirectFilter``.

    Pure ASGI, not ``BaseHTTPMiddleware``: it only looks at a GET/HEAD it could answer, lets the
    app run first and steps in when the app answered 404 (so an app's own routes, and the sync
    API, always win), and never touches a streamed response (the SSE endpoints pass through
    untouched). What it answers: a file of the renderer at the origin root (``/assets/…``), the
    renderer's page at the mount and at any deep link under it that accepts HTML and names no
    file; nothing under ``/mateu`` (an API miss stays a 404, never the page)."""

    #: the status the answer is sent with (the API hint answers a 404 with a body of its own)
    status = 200

    def __init__(self, app, renderer: ui_page.RendererFiles, base_url: str, title: str, debug: bool = False):
        self.app = app
        self.renderer = renderer
        # the mount as a path ("" for the root, "/shop" otherwise), whatever spelling it was given in
        mount = base_url.strip("/")
        self.base_url = "/" + mount if mount else ""
        self.title = title
        self.debug = debug

    def answer(self, path: str, accept: str | None) -> tuple[str, bytes, str | None] | None:
        """``(content type, body, cache control)`` for what this middleware would serve at ``path``,
        or None when the request is not ours."""
        if path != "/" and "." in path.rsplit("/", 1)[-1]:
            body = self.renderer.read(path)
            if body is None:
                return None
            return ui_page.content_type_of(path), body, ui_page.cache_control_for(path)
        is_mount = path == (self.base_url or "/") or path == self.base_url + "/"
        if not (is_mount or (ui_page.spa_candidate(path) and ui_page.under_mount(path, self.base_url))):
            return None
        if not ui_page.accepts_html(accept):
            return None
        html = ui_page.render_index(self.renderer.index_template(), self.base_url, self.title, self.debug)
        return "text/html; charset=utf-8", html.encode("utf-8"), ui_page.REVALIDATE_CACHE_CONTROL

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope.get("method") not in ("GET", "HEAD"):
            await self.app(scope, receive, send)
            return
        accept = next((v.decode("latin-1") for k, v in scope.get("headers", []) if k == b"accept"), None)
        answer = self.answer(scope["path"], accept)
        if answer is None:
            await self.app(scope, receive, send)
            return
        state = {"started": False, "swallow": False}

        async def send_wrapper(message):
            if message["type"] == "http.response.start" and not state["started"]:
                state["started"] = True
                if message["status"] == 404:
                    state["swallow"] = True
                    return
            if state["swallow"]:
                return
            await send(message)

        await self.app(scope, receive, send_wrapper)
        if not state["swallow"]:
            return
        content_type, body, cache_control = answer
        headers = [(b"content-type", content_type.encode("latin-1")), (b"content-length", str(len(body)).encode())]
        if cache_control:
            headers.append((b"cache-control", cache_control.encode("latin-1")))
        await send({"type": "http.response.start", "status": self.status, "headers": headers})
        await send({"type": "http.response.body", "body": b"" if scope["method"] == "HEAD" else body})


class MateuApiHintMiddleware(MateuUiMiddleware):
    """Without a renderer: a GET of the mount that explicitly accepts HTML (a browser navigation)
    and that nothing else answered gets ``ui_page.api_hint_page`` — still a 404, so a JSON client
    or a health check sees exactly what it saw before."""

    status = 404

    def __init__(self, app, base_url: str):
        mount = base_url.strip("/")
        self.app = app
        self.base_url = "/" + mount if mount else ""

    def answer(self, path: str, accept: str | None) -> tuple[str, bytes, str | None] | None:
        if path not in (self.base_url or "/", self.base_url + "/"):
            return None
        if not accept or "text/html" not in accept:
            return None
        return "text/html; charset=utf-8", ui_page.api_hint_page(self.base_url).encode("utf-8"), None


def _add_dev_endpoints(app: FastAPI) -> None:
    """``GET /mateu/dev/events`` (SSE: hello with the boot id, then every change, a ping every 15 s)
    and ``POST /mateu/dev/reload[?scope=app]`` (204), at the server root like Java's."""
    import asyncio

    async def events(request: Request) -> StreamingResponse:
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue[str] = asyncio.Queue()
        queue.put_nowait(dev_specs.hello())
        def push(json: str) -> None:
            loop.call_soon_threadsafe(queue.put_nowait, json)

        unsubscribe = dev_specs.subscribe(push)

        async def stream():
            try:
                while True:
                    try:
                        json = await asyncio.wait_for(queue.get(), timeout=15)
                    except asyncio.TimeoutError:
                        json = '{"type":"ping"}'
                    if await request.is_disconnected():
                        break
                    yield f"data: {json}\n\n"
            finally:
                unsubscribe()

        return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})

    async def reload(request: Request) -> Response:
        dev_specs.reload(request.query_params.get("scope"))
        return Response(status_code=204)

    app.add_api_route(dev_specs.EVENTS_PATH, events, methods=["GET"])
    app.add_api_route(dev_specs.RELOAD_PATH, reload, methods=["POST"])


__all__ = ["CORRELATION_HEADER", "MateuUiMiddleware", "add_mateu"]
