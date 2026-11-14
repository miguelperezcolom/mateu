"""The header's user menu — the Python mirror of Java's ``UserMenuSyncTest`` + ``UserProfilesTest``:
the app shell names the signed-in user (``AppMetadata.user``) — from the app's
``UserProfileSupplier`` when it answers, else from the identity's claims — and nobody for an
anonymous caller."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core.identity import identity_from_claims  # noqa: E402
from mateu_ui.core.user_profiles import from_claims, profile_of  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Identity,
    UserProfile,
    UserProfileSupplier,
    app,
    menu_item,
    title,
    ui,
)


@ui("user-menu-home")
@title("User menu home")
class UserMenuHome:
    name: str | None = None


@ui("user-menu")
@app("User menu")
class UserMenuApp:
    @menu_item("Home")
    def home(self) -> "UserMenuHome":
        return UserMenuHome()


class Directory(UserProfileSupplier):
    """Knows how to show "ana"; says nothing about anyone else."""

    def profile(self, identity: Identity):
        if identity.name == "ana":
            return UserProfile("Ana López", "ana@example.com", "https://example.com/ana.png")
        return None


class Broken(UserProfileSupplier):
    def profile(self, identity: Identity):
        raise RuntimeError("directory down")


MODULE = sys.modules[__name__]


def app_meta(identity: Identity | None = None, **kwargs) -> dict:
    api = fastapi.FastAPI()
    add_mateu(api, MODULE, **kwargs)

    @api.middleware("http")
    async def authenticate(request, call_next):
        if identity is not None:
            request.state.mateu_identity = identity
        return await call_next(request)

    body = TestClient(api).post(
        "/mateu/v3/sync/user-menu", json={"route": "user-menu", "consumedRoute": "_empty", "actionId": ""}
    ).json()
    return body["fragments"][0]["component"]["metadata"]


def test_an_anonymous_caller_is_named_nowhere():
    assert "user" not in app_meta()


def test_the_apps_supplier_decides_how_a_user_is_shown():
    user = app_meta(Identity(name="ana"), user_profile_suppliers=[Directory()])["user"]
    assert user == {"name": "Ana López", "email": "ana@example.com", "picture": "https://example.com/ana.png"}


def test_when_the_supplier_says_nothing_the_authenticated_name_is_shown():
    user = app_meta(Identity(name="clerk"), user_profile_suppliers=[Broken(), Directory()])["user"]
    assert user == {"name": "clerk"}


def test_the_verified_claims_describe_the_user():
    identity = identity_from_claims(
        {"preferred_username": "ana", "name": "Ana López", "email": "ana@example.com",
         "picture": "https://example.com/ana.png"}
    )
    assert app_meta(identity)["user"] == {
        "name": "Ana López", "email": "ana@example.com", "picture": "https://example.com/ana.png",
    }


def test_a_starlette_user_is_shown_by_its_name():
    from starlette.authentication import AuthCredentials, AuthenticationBackend, SimpleUser
    from starlette.middleware.authentication import AuthenticationMiddleware

    class GithubUser(SimpleUser):
        avatar_url = "https://avatars.githubusercontent.com/u/1"

    class HeaderBackend(AuthenticationBackend):
        async def authenticate(self, conn):
            if conn.headers.get("x-session") == "valid":
                return AuthCredentials([]), GithubUser("octocat")
            return None

    api = fastapi.FastAPI()
    add_mateu(api, MODULE)
    api.add_middleware(AuthenticationMiddleware, backend=HeaderBackend())
    meta = TestClient(api).post(
        "/mateu/v3/sync/user-menu", json={"route": "user-menu", "consumedRoute": "_empty", "actionId": ""},
        headers={"X-Session": "valid"},
    ).json()["fragments"][0]["component"]["metadata"]
    assert meta["user"] == {"name": "octocat", "picture": "https://avatars.githubusercontent.com/u/1"}


def test_an_oidc_user_is_shown_by_name_email_and_picture():
    profile = from_claims(
        {"name": "Ana López", "email": "ana@example.com", "picture": "https://example.com/ana.png",
         "preferred_username": "ana"},
        "sub-1",
    )
    assert profile == UserProfile("Ana López", "ana@example.com", "https://example.com/ana.png")


def test_a_github_user_is_shown_by_name_and_avatar():
    profile = from_claims(
        {"login": "miguelperezcolom", "name": "Miguel Pérez",
         "avatar_url": "https://avatars.githubusercontent.com/u/1"},
        "miguelperezcolom",
    )
    assert profile.name == "Miguel Pérez"
    assert profile.picture == "https://avatars.githubusercontent.com/u/1"
    assert profile.email is None


def test_without_a_name_the_login_then_the_identitys_name_is_shown():
    assert from_claims({"login": "octocat"}, "42").name == "octocat"
    assert from_claims({"given_name": "Ana", "family_name": "López"}, "x").name == "Ana López"
    assert from_claims({}, "alice").name == "alice"
    assert from_claims({"name": "  "}, "alice").name == "alice"


def test_only_an_http_picture_is_kept():
    assert from_claims({"picture": "javascript:alert(1)"}, "a").picture is None
    assert from_claims({"picture": "data:x", "avatar_url": "https://a.example/1"}, "a").picture == "https://a.example/1"


def test_nobody_without_an_identity_name():
    assert profile_of(None) is None
    assert profile_of(Identity(name="  ", claims={"name": "Ana"})) is None


def test_a_profile_needs_a_name_and_drops_blank_details():
    with pytest.raises(ValueError):
        UserProfile(" ")
    profile = UserProfile("Ana", " ", "")
    assert profile.email is None and profile.picture is None


def test_claims_never_change_who_the_identity_is():
    assert Identity(name="ana", claims={"name": "A"}) == Identity(name="ana")
    assert hash(Identity(name="ana", claims={"name": "A"})) == hash(Identity(name="ana"))
