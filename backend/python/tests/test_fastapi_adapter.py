"""The FastAPI adapter: identity & secrets per request, opt-in CORS, the error boundary, and the
handler running off the event loop with per-request state in ContextVars."""

from __future__ import annotations

import base64
import json
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.errors import error_increment  # noqa: E402
from mateu_core.identity import identity_from_claims  # noqa: E402
from mateu_core.request_context import (  # noqa: E402
    MateuRequest,
    bearer_token,
    bound_request,
    current_request,
)
from mateu_fastapi import CORRELATION_HEADER, add_mateu  # noqa: E402
from mateu_uidl import EyesOnly, Identity, UserFacingError, button, title, ui  # noqa: E402

MODULE = sys.modules[__name__]
SEEN_THREADS: list[str] = []


@ui("adapter-gated")
@title("Gated")
class Gated:
    public: str = "everyone"
    salary: Annotated[str, EyesOnly(roles=("hr",))] = "100k"


@ui("adapter-boom")
@title("Boom")
class Boom:
    name: str = "x"

    @button()
    def explode(self):
        raise RuntimeError("db password is hunter2")

    @button()
    def refuse(self):
        raise UserFacingError("The booking is already closed", title="Cannot cancel")

    @button()
    def where(self):
        SEEN_THREADS.append(threading.current_thread().name)
        from mateu_uidl import Message

        return Message("ok")


def unsigned_jwt(claims: dict) -> str:
    def b64(obj) -> str:
        return base64.urlsafe_b64encode(json.dumps(obj).encode()).rstrip(b"=").decode()

    return f"{b64({'alg': 'none', 'typ': 'JWT'})}.{b64(claims)}.sig"


def client(**kwargs) -> TestClient:
    app = fastapi.FastAPI()
    add_mateu(app, MODULE, **kwargs)
    return TestClient(app)


def load(c: TestClient, route: str, headers=None):
    return c.post(f"/mateu/v3/sync/{route}", json={"route": route}, headers=headers or {})


# ── identity ─────────────────────────────────────────────────────────────────


def test_without_a_token_an_eyes_only_field_is_hidden():
    body = load(client(), "adapter-gated").text
    assert "everyone" in body and "100k" not in body


def test_a_bearer_token_alone_grants_nothing():
    # Mateu does not authenticate: a token's claims are never read, whatever they say
    token = unsigned_jwt({"sub": "ann", "realm_access": {"roles": ["hr"]}})
    body = load(client(), "adapter-gated", {"Authorization": f"Bearer {token}"}).text
    assert "100k" not in body


def test_the_identity_the_app_put_in_request_state_is_used():
    app = fastapi.FastAPI()
    add_mateu(app, MODULE)

    @app.middleware("http")
    async def authenticate(request, call_next):
        if request.headers.get("x-session") == "valid":
            request.state.mateu_identity = identity_from_claims({"realm_access": {"roles": ["hr"]}})
        return await call_next(request)

    c = TestClient(app)
    assert "100k" in load(c, "adapter-gated", {"X-Session": "valid"}).text
    assert "100k" not in load(c, "adapter-gated", {"X-Session": "forged"}).text


def test_the_principal_authenticated_by_the_app_is_trusted():
    from starlette.authentication import AuthCredentials, AuthenticationBackend, SimpleUser
    from starlette.middleware.authentication import AuthenticationMiddleware

    class HrUser(SimpleUser):
        roles = ("hr",)

    class HeaderBackend(AuthenticationBackend):
        async def authenticate(self, conn):
            if conn.headers.get("x-session") == "valid":
                return AuthCredentials(["read"]), HrUser("ann")
            return None

    app = fastapi.FastAPI()
    add_mateu(app, MODULE)
    app.add_middleware(AuthenticationMiddleware, backend=HeaderBackend())
    c = TestClient(app)
    assert "100k" in load(c, "adapter-gated", {"X-Session": "valid"}).text
    assert "100k" not in load(c, "adapter-gated", {"X-Session": "nope"}).text


def test_a_custom_parameterless_provider_reads_the_request_in_flight():
    def from_header() -> Identity | None:
        rq = current_request()
        role = rq.header("x-role") if rq else None
        return Identity(roles=(role,)) if role else None

    c = client(identity_provider=from_header)
    assert "100k" in load(c, "adapter-gated", {"X-Role": "hr"}).text
    assert "100k" not in load(c, "adapter-gated", {"X-Role": "ops"}).text


def test_claims_map_like_java_authorizer():
    ident = identity_from_claims(
        {
            "realm_access": {"roles": ["a"]},
            "resource_access": {"app": {"roles": ["b"]}},
            "roles": ["c", "a"],
            "groups": ["g"],
            "scope": "read write",
            "permissions": ["p"],
        }
    )
    assert ident.roles == ("a", "b", "c")
    assert ident.groups == ("g",) and ident.scopes == ("read", "write") and ident.permissions == ("p",)
    assert identity_from_claims({"scp": ["s1"]}).scopes == ("s1",)


def test_the_secrets_provider_reaches_the_handler():
    app = fastapi.FastAPI()
    h = add_mateu(app, MODULE, secrets_provider=lambda k: "s3cr3t" if k == "API_KEY" else None)
    assert h._resolve_secret("API_KEY") == "s3cr3t"


def test_bearer_token_is_read_case_insensitively():
    with bound_request(MateuRequest(headers={"authorization": "bearer abc"})):
        assert bearer_token() == "abc"
    assert current_request() is None


# ── CORS ─────────────────────────────────────────────────────────────────────


def test_cors_is_off_by_default():
    r = client().options(
        "/mateu/v3/sync/adapter-gated",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in r.headers


def test_cors_allows_only_the_listed_origins():
    c = client(cors_origins=["https://app.example"])
    ok = c.options(
        "/mateu/v3/sync/adapter-gated",
        headers={"Origin": "https://app.example", "Access-Control-Request-Method": "POST"},
    )
    assert ok.headers.get("access-control-allow-origin") == "https://app.example"
    other = c.options(
        "/mateu/v3/sync/adapter-gated",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert other.headers.get("access-control-allow-origin") != "https://evil.example"


def test_cors_true_without_origins_is_refused():
    with pytest.raises(ValueError, match="cors_origins"):
        add_mateu(fastapi.FastAPI(), MODULE, cors=True)


# ── error boundary ───────────────────────────────────────────────────────────


def act(c: TestClient, action: str):
    return c.post(
        "/mateu/v3/sync/adapter-boom",
        json={"route": "adapter-boom", "actionId": action, "componentState": {"name": "x"}},
    )


def test_an_unhandled_exception_is_a_generic_error_toast_with_a_correlation_id(caplog):
    r = act(client(dev=False), "explode")
    assert r.status_code == 200
    body = r.json()
    cid = r.headers[CORRELATION_HEADER]
    [msg] = body["messages"]
    assert msg["variant"] == "error"
    assert cid in msg["text"]
    assert "hunter2" not in r.text  # the detail never reaches the user in production
    assert any(cid in rec.getMessage() for rec in caplog.records)  # ... it reaches the log


def test_dev_mode_shows_the_exception_like_java():
    r = act(client(dev=True), "explode")
    [msg] = r.json()["messages"]
    assert msg["title"] == "RuntimeError" and "hunter2" in msg["text"]


def test_a_user_facing_error_is_shown_as_written():
    r = act(client(dev=False), "refuse")
    [msg] = r.json()["messages"]
    assert msg["title"] == "Cannot cancel" and msg["text"] == "The booking is already closed"


def test_a_malformed_body_is_an_error_toast_not_a_500():
    r = client().post("/mateu/v3/sync/adapter-boom", content=b"{not json")
    assert r.status_code == 200 and r.json()["messages"][0]["variant"] == "error"


def test_error_increment_unwraps_the_cause():
    try:
        try:
            raise UserFacingError("Nope")
        except UserFacingError as inner:
            raise RuntimeError("wrapper") from inner
    except RuntimeError as e:
        inc = error_increment(e, "cid", dev=False)
    assert inc.messages[0].text == "Nope"


# ── off the event loop, state per request ──────────────────────────────────


def test_the_handler_runs_in_a_worker_thread_not_on_the_event_loop():
    SEEN_THREADS.clear()
    act(client(), "where")
    assert SEEN_THREADS and SEEN_THREADS[0] != threading.main_thread().name


def test_concurrent_requests_never_see_each_others_identity():
    def provider() -> Identity | None:
        rq = current_request()
        role = rq.header("x-role") if rq else None
        return Identity(roles=(role,)) if role else None

    handler = SyncHandler(MateuRegistry(MODULE), identity_provider=provider)

    def one(role: str) -> bool:
        with bound_request(MateuRequest(headers={"x-role": role})):
            body = handler.handle(RunActionRq(route="adapter-gated")).model_dump_json(by_alias=True)
        return "100k" in body

    roles = ["hr" if i % 2 == 0 else "ops" for i in range(40)]
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(one, roles))
    assert results == [r == "hr" for r in roles]
