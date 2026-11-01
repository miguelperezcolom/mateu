"""The mobile-app UI manifest (``GET <base>/mateu/v3/manifest``) and the "Open on mobile" flag —
the Python mirror of Java's ``MobileManifestTest`` / .NET's ``MobileManifestTests``. The JSON strings
are the shared parity fixtures: the three backends must answer exactly these bytes."""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, mobile_manifest, type_name  # noqa: E402
from mateu_ui.uidl import app, menu_item, mobile_app, title, ui  # noqa: E402

ACME = (
    '{"name":"Acme CRM","shortName":"CRM","icon":"/images/acme.svg","themeColor":"#1f6feb",'
    '"wireVersion":"3.0","minAppVersion":"1.0.0","auth":{"type":"oidc",'
    '"issuer":"https://auth.acme.com/realms/acme","clientId":"mateu-mobile",'
    '"scopes":["openid","profile"]}}'
)
PLAIN = '{"name":"Plain","shortName":"Plain","wireVersion":"3.0","minAppVersion":"1.0.0"}'

SETTINGS = (
    "MATEU_MOBILE_NAME",
    "MATEU_MOBILE_SHORT_NAME",
    "MATEU_MOBILE_ICON",
    "MATEU_MOBILE_THEME_COLOR",
    "MATEU_MOBILE_MIN_APP_VERSION",
    "MATEU_MOBILE_OIDC_ISSUER",
    "MATEU_MOBILE_OIDC_CLIENT_ID",
    "MATEU_MOBILE_OIDC_SCOPES",
)


@pytest.fixture(autouse=True)
def no_settings(monkeypatch):
    for name in SETTINGS:
        monkeypatch.delenv(name, raising=False)


@ui("mm-home")
@title("Home")
class MmHome:
    name: str | None = None


# The port has no app logo: the Acme fixture's icon comes from @mobile_app(icon=...).
@app("Acme CRM", mobile_qr=True)
@mobile_app(
    short_name="CRM",
    icon="/images/acme.svg",
    theme_color="#1f6feb",
    oidc_issuer="https://auth.acme.com/realms/acme",
    oidc_client_id="mateu-mobile",
)
class AcmeApp:
    @menu_item("Home")
    def home(self) -> "MmHome":
        return MmHome()


@app("Plain")
class PlainApp:
    @menu_item("Home")
    def home(self) -> "MmHome":
        return MmHome()


def test_acme_fixture():
    assert mobile_manifest.manifest_json(AcmeApp) == ACME


def test_plain_fixture():
    assert mobile_manifest.manifest_json(PlainApp) == PLAIN


def test_settings_win(monkeypatch):
    monkeypatch.setenv("MATEU_MOBILE_OIDC_ISSUER", "https://idp.example")
    monkeypatch.setenv("MATEU_MOBILE_OIDC_CLIENT_ID", "app")
    monkeypatch.setenv("MATEU_MOBILE_OIDC_SCOPES", "openid email")
    body = json.loads(mobile_manifest.manifest_json(PlainApp))
    assert body["auth"] == {
        "type": "oidc",
        "issuer": "https://idp.example",
        "clientId": "app",
        "scopes": ["openid", "email"],
    }
    # ...also over what @mobile_app declares
    monkeypatch.setenv("MATEU_MOBILE_NAME", "Acme (staging)")
    body = json.loads(mobile_manifest.manifest_json(AcmeApp))
    assert body["name"] == "Acme (staging)"
    assert body["shortName"] == "CRM"
    assert body["auth"]["issuer"] == "https://idp.example"


def test_auth_needs_both_issuer_and_client_id(monkeypatch):
    monkeypatch.setenv("MATEU_MOBILE_OIDC_ISSUER", "https://idp.example")
    assert "auth" not in json.loads(mobile_manifest.manifest_json(PlainApp))


def test_name_falls_back_to_the_humanized_class_name():
    class BackOffice:
        pass

    assert json.loads(mobile_manifest.manifest_json(BackOffice))["name"] == "Back office"


def test_the_endpoint_is_public_and_cacheable():
    fastapi = pytest.importorskip("fastapi")
    from fastapi.testclient import TestClient

    from mateu_ui.fastapi import add_mateu

    api = fastapi.FastAPI()
    add_mateu(api, AcmeApp, MmHome, identity_provider=lambda: None)
    client = TestClient(api)
    response = client.get("/mateu/v3/manifest")
    assert response.status_code == 200
    assert response.text == ACME
    assert response.headers["content-type"] == "application/json"
    assert response.headers["cache-control"] == "public, max-age=300"
    assert response.headers["x-content-type-options"] == "nosniff"

    mounted = fastapi.FastAPI()
    add_mateu(mounted, PlainApp, MmHome, base_url="/crm", identity_provider=lambda: None)
    assert TestClient(mounted).get("/crm/mateu/v3/manifest").text == PLAIN


def meta(cls) -> dict:
    inc = SyncHandler(MateuRegistry(cls, MmHome)).handle(RunActionRq(server_side_type=type_name(cls)))
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))["fragments"][0][
        "component"
    ]["metadata"]


def test_mobile_qr_is_opt_in():
    assert meta(PlainApp)["mobileQr"] is False
    assert meta(AcmeApp)["mobileQr"] is True


# The Mateu release travels as `mateuVersion` (after minAppVersion) so the hub apps can tell whether
# they predate this UI (conformance/client/app-compat.json) — only a release: a dev build names none.
# Same rule and JSON as Java's MobileManifestVersionTest and .NET's MobileManifestTests.
def test_a_release_travels_after_min_app_version():
    out = json.dumps(mobile_manifest.manifest(None, "3.0.0b33"), separators=(",", ":"))
    assert out == (
        '{"name":"Mateu","shortName":"Mateu","wireVersion":"3.0","minAppVersion":"1.0.0",'
        '"mateuVersion":"3.0.0b33"}'
    )


@pytest.mark.parametrize("dev", ["", "0.0.1-MATEU", "3.0-SNAPSHOT", "3.0.0.dev0", "3.0.0-dev"])
def test_a_development_build_sends_no_version(dev):
    assert "mateuVersion" not in mobile_manifest.manifest(None, dev)


@pytest.mark.parametrize("release", ["3.0-beta.33", "3.0-rc.1", "3.1.0", "3.0", "3.0.0-beta.33", "3.0.0b33", "3.0.0a412"])
def test_releases_of_every_port_are_recognised(release):
    assert mobile_manifest.release_version(release) == release


def test_in_development_mode_the_manifest_says_where_the_live_reload_events_are(tmp_path):
    from mateu_ui.core import dev_specs

    try:
        dev_specs.enable(False)
        assert "devEvents" not in mobile_manifest.manifest(None, "3.0-beta.35")
        dev_specs.enable(True, str(tmp_path))
        assert mobile_manifest.manifest(None, "3.0-beta.35")["devEvents"] == "/mateu/dev/events"
    finally:
        dev_specs.enable(False)
