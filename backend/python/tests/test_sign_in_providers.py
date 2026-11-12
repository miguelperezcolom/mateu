"""Sign-in providers: conformance/client/sign-in.json (settings → the manifest's ``auth`` block and the
page's ``<meta name="mateu-auth">``) byte for byte as Java (the reference) and .NET, plus where they
reach: the served page and the manifest."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from mateu_ui.core import mobile_manifest, sign_in_providers, ui_page
from mateu_ui.core.sign_in_providers import Supplied
from mateu_ui.uidl import SignInProvider

CORPUS = Path(__file__).resolve().parents[3] / "conformance" / "client" / "sign-in.json"


def _cases():
    return json.loads(CORPUS.read_text(encoding="utf-8"))["cases"]


def _supplied(code) -> Supplied:
    if not code:
        return Supplied()
    providers = [
        SignInProvider(
            id=p.get("id"),
            type=p.get("type"),
            label=p.get("label"),
            icon=p.get("icon"),
            issuer=p.get("issuer"),
            client_id=p.get("clientId"),
            scopes=p.get("scopes"),
            audience=p.get("audience"),
            url=p.get("url"),
            platforms=p.get("platforms"),
            continue_param=p.get("continueParam"),
        )
        for p in code.get("providers", [])
    ]
    return Supplied(providers, code.get("loginOnStart"), code.get("logoutUrl"))


@pytest.mark.parametrize("case", _cases(), ids=lambda c: c["name"])
def test_the_corpus(case):
    # the settings arrive as environment variables in this port
    env = {sign_in_providers.env_name(k): v for k, v in case["settings"].items()}
    warnings: list[str] = []
    auth = sign_in_providers.auth_block(
        lambda key: env.get(sign_in_providers.env_name(key)), _supplied(case.get("code")), None, warnings.append
    )
    expected = case.get("auth")
    assert (None if auth is None else sign_in_providers.to_json(auth)) == (
        None if expected is None else sign_in_providers.to_json(expected)
    )
    assert sign_in_providers.meta(auth) == case.get("meta")
    assert len(warnings) == case["warnings"], warnings


TEMPLATE = (
    "<html><head><!-- AQUIFAVICON --><title>AQUIELTITULODELAPAGINA</title></head>"
    "<body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>"
)


def test_the_served_page_carries_the_web_providers(monkeypatch):
    monkeypatch.setenv("MATEU_AUTH_PROVIDERS", "github")
    html = ui_page.render_index(TEMPLATE, "/crm", "CRM")
    assert (
        '<meta name="mateu-auth" content="{&quot;loginOnStart&quot;:true,&quot;providers&quot;:'
        "[{&quot;id&quot;:&quot;github&quot;,&quot;type&quot;:&quot;redirect&quot;,"
        "&quot;label&quot;:&quot;GitHub&quot;,&quot;icon&quot;:&quot;github&quot;,"
        "&quot;url&quot;:&quot;/oauth2/authorization/github&quot;,"
        '&quot;platforms&quot;:[&quot;web&quot;]}]}">' in html
    )
    monkeypatch.delenv("MATEU_AUTH_PROVIDERS")
    assert "mateu-auth" not in ui_page.render_index(TEMPLATE, "/crm", "CRM")


def test_providers_given_to_add_mateu_reach_the_manifest(monkeypatch):
    for name in ("MATEU_AUTH_PROVIDERS", "MATEU_MOBILE_OIDC_ISSUER", "MATEU_MOBILE_OIDC_CLIENT_ID"):
        monkeypatch.delenv(name, raising=False)
    sign_in_providers.configure(
        [SignInProvider("acme", type="oidc", label="Acme SSO", issuer="https://idp.acme.com", client_id="ui")],
        logout_url="/logout",
    )
    try:
        out = mobile_manifest.manifest(None, "3.0.0.dev0")
        assert sign_in_providers.to_json(out["auth"]) == (
            '{"type":"oidc","issuer":"https://idp.acme.com","clientId":"ui","scopes":["openid","profile"],'
            '"loginOnStart":true,"providers":[{"id":"acme","type":"oidc","label":"Acme SSO","icon":"key",'
            '"issuer":"https://idp.acme.com","clientId":"ui","scopes":["openid","profile"],'
            '"platforms":["web","mobile","desktop"]}],"logoutUrl":"/logout"}'
        )
    finally:
        sign_in_providers.configure(None)


def test_an_unusable_provider_is_warned_at_startup(monkeypatch, caplog):
    monkeypatch.setenv("MATEU_AUTH_PROVIDERS", "keycloak-x")
    monkeypatch.setenv("MATEU_AUTH_PROVIDERS_KEYCLOAK_X_CLIENT_ID", "ui")
    with caplog.at_level("WARNING", logger="mateu_ui"):
        sign_in_providers.warn_on_startup()
    assert any("keycloak-x" in r.message and "issuer" in r.message for r in caplog.records)
