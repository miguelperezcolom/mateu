"""The ways to sign in to a UI — the ``auth`` block of the mobile manifest and the
``<meta name="mateu-auth">`` of the served web page, which every client (web, phone, desktop)
offers: one provider → straight to it, several → a sign-in chooser. The Python twin of Java's
``io.mateu.core.infra.security.SignInProviders`` and .NET's ``SignInProviders``: the same rules and
the same JSON byte for byte, pinned by ``conformance/client/sign-in.json``.

Mateu OFFERS the sign-in; it never validates a token or a session — the host framework does.

Where the providers come from, the first that names any wins (never merged):

1. the environment: ``MATEU_AUTH_PROVIDERS=acme,github`` (display order) with
   ``MATEU_AUTH_PROVIDERS_<ID>_TYPE|LABEL|ICON|ISSUER|CLIENT_ID|SCOPES|AUDIENCE|URL|PLATFORMS|
   CONTINUE_PARAM|TENANT`` (Java's ``mateu.auth.providers.<id>.<member>``);
2. the providers given to ``add_mateu(sign_in=[...])``;
3. the single provider of before (``MATEU_MOBILE_OIDC_*`` / ``@mobile_app(oidc_issuer=…)``), as
   the native-only provider ``default``.
"""

from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass, field
from typing import Any, Callable, Mapping, Sequence

log = logging.getLogger("mateu_ui")

PROVIDERS = "mateu.auth.providers"
LOGIN_ON_START = "mateu.auth.login-on-start"
LOGOUT_URL = "mateu.auth.logout-url"
META_NAME = "mateu-auth"

DEFAULT_SCOPES = ["openid", "profile"]

ICONS = [
    "google", "microsoft", "apple", "github", "facebook", "x",
    "linkedin", "gitlab", "okta", "auth0", "keycloak", "key",
]

_ALL_PLATFORMS = ["web", "mobile", "desktop"]
_WEB_ONLY = ["web"]
_NATIVE_ONLY = ["mobile", "desktop"]

MICROSOFT_ISSUER = "https://login.microsoftonline.com/{}/v2.0"

# id -> (type, label, icon, issuer, platforms)
PRESETS: dict[str, tuple[str, str, str, str | None, list[str] | None]] = {
    # Google's web clients need a client secret: a public (PKCE) client is a native one
    "google": ("oidc", "Google", "google", "https://accounts.google.com", _NATIVE_ONLY),
    "microsoft": ("oidc", "Microsoft", "microsoft", None, None),
    "entra": ("oidc", "Microsoft Entra ID", "microsoft", None, None),
    "keycloak": ("oidc", "Keycloak", "keycloak", None, None),
    "okta": ("oidc", "Okta", "okta", None, None),
    "auth0": ("oidc", "Auth0", "auth0", None, None),
    "cognito": ("oidc", "Amazon Cognito", "key", None, None),
    "zitadel": ("oidc", "Zitadel", "key", None, None),
    "authentik": ("oidc", "Authentik", "key", None, None),
    "apple": ("redirect", "Apple", "apple", None, None),
    "github": ("redirect", "GitHub", "github", None, None),
    "facebook": ("redirect", "Facebook", "facebook", None, None),
    "x": ("redirect", "X", "x", None, None),
    "linkedin": ("redirect", "LinkedIn", "linkedin", None, None),
    "gitlab": ("redirect", "GitLab", "gitlab", None, None),
}

_ID = re.compile(r"[A-Za-z0-9_-]+")
_HTTP_URL = re.compile(r"^https?://[^\s\"'<>]+$", re.IGNORECASE)
_PATH_URL = re.compile(r"^/(?!/)[^\s\"'<>]*$")


@dataclass
class _Input:
    id: str | None
    type: str | None = None
    label: str | None = None
    icon: str | None = None
    issuer: str | None = None
    client_id: str | None = None
    scopes: list[str] | None = None
    audience: str | None = None
    url: str | None = None
    platforms: list[str] | None = None
    continue_param: bool | None = None
    tenant: str | None = None


@dataclass
class Supplied:
    """The providers declared in code (``add_mateu(sign_in=…)``) and the two block-level members."""

    providers: list[Any] = field(default_factory=list)
    login_on_start: bool | None = None
    logout_url: str | None = None


_configured = Supplied()
_warned: set[str] = set()


def configure(
    providers: Sequence[Any] | None, login_on_start: bool | None = None, logout_url: str | None = None
) -> None:
    """What ``add_mateu(sign_in=…, login_on_start=…, logout_url=…)`` declares (process-wide)."""
    global _configured
    _configured = Supplied(list(providers or []), login_on_start, logout_url)


def env_name(key: str) -> str:
    """Java's ``MateuSettings.envName``: upper-cased, '.' and '-' as '_'."""
    return key.upper().replace(".", "_").replace("-", "_")


def env_settings(key: str) -> str | None:
    return os.environ.get(env_name(key))


def _blank(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _split(value: str | None) -> list[str]:
    if value is None:
        return []
    out: list[str] = []
    for part in re.split(r"[,\s]+", value):
        if part and part not in out:
            out.append(part)
    return out


def _usable_url(url: str) -> bool:
    return bool(_PATH_URL.match(url) or _HTTP_URL.match(url))


def humanize(id_: str) -> str:
    """``acme-sso`` → ``Acme sso``."""
    spaced = re.sub(r"[-_]+", " ", id_).strip()
    if not spaced:
        return id_
    return spaced[0].upper() + spaced[1:]


def _warn_once(message: str) -> None:
    if len(_warned) < 256 and message not in _warned:
        _warned.add(message)
        log.warning(message)


# ----------------------------------------------------------------------------------- the inputs


def _from_settings(id_: str, settings: Callable[[str], str | None]) -> _Input:
    key = f"{PROVIDERS}.{id_}."

    def s(name: str) -> str | None:
        return _blank(settings(key + name))

    scopes = s("scopes")
    platforms = s("platforms")
    continue_param = s("continue-param")
    return _Input(
        id=id_,
        type=s("type"),
        label=s("label"),
        icon=s("icon"),
        issuer=s("issuer"),
        client_id=s("client-id"),
        scopes=None if scopes is None else _split(scopes),
        audience=s("audience"),
        url=s("url"),
        platforms=None if platforms is None else _split(platforms),
        continue_param=None if continue_param is None else continue_param.lower() != "false",
        tenant=s("tenant"),
    )


def _from_code(p: Any) -> _Input:
    if isinstance(p, Mapping):
        get = p.get
    else:
        def get(name: str, default: Any = None) -> Any:
            return getattr(p, name, default)
    scopes = get("scopes")
    platforms = get("platforms")
    return _Input(
        id=_blank(get("id")),
        type=_blank(get("type")),
        label=get("label"),
        icon=get("icon"),
        issuer=get("issuer"),
        client_id=get("client_id"),
        scopes=None if scopes is None else list(scopes),
        audience=get("audience"),
        url=get("url"),
        platforms=None if platforms is None else [str(x) for x in platforms],
        continue_param=get("continue_param"),
    )


def _legacy(settings: Callable[[str], str | None], declared: Mapping[str, Any] | None) -> _Input | None:
    declared = declared or {}
    issuer = _blank(settings("mateu.mobile.oidc.issuer")) or _blank(declared.get("oidc_issuer"))
    client_id = _blank(settings("mateu.mobile.oidc.client-id")) or _blank(declared.get("oidc_client_id"))
    if issuer is None or client_id is None:
        return None
    scopes = _split(settings("mateu.mobile.oidc.scopes"))
    if not scopes:
        for scope in declared.get("scopes") or []:
            for s in _split(scope):
                if s not in scopes:
                    scopes.append(s)
    # native only, as it always was: its client id is the phone/desktop app's
    return _Input(
        id="default", type="oidc", label="Sign in", icon="key", issuer=issuer, client_id=client_id,
        scopes=scopes, platforms=list(_NATIVE_ONLY),
    )


# ------------------------------------------------------------------------------------ the rules


def _icon(given: str | None, preset, id_: str, warn: Callable[[str], None]) -> str:
    icon = _blank(given)
    if icon is not None:
        lower = icon.lower()
        if lower in ICONS:
            return lower
        warn(f"Sign-in provider '{id_}': icon '{icon}' is not one of {'|'.join(ICONS)}; 'key' is shown.")
        return "key"
    return preset[2] if preset else "key"


def _platforms(given: list[str] | None, id_: str, warn: Callable[[str], None]) -> list[str] | None:
    if given is None:
        return None
    named: set[str] = set()
    for raw in given:
        p = _blank(raw)
        if p is None:
            continue
        lower = p.lower()
        if lower in _ALL_PLATFORMS:
            named.add(lower)
        else:
            warn(f"Sign-in provider '{id_}': platform '{p}' is not web, mobile or desktop.")
    ordered = [p for p in _ALL_PLATFORMS if p in named]
    return ordered or None


def _resolve(i: _Input, warn: Callable[[str], None]) -> dict[str, Any] | None:
    id_ = i.id
    assert id_ is not None
    lower_id = id_.lower()
    preset = PRESETS.get(lower_id)
    url = _blank(i.url)
    type_ = _blank(i.type)
    if type_ is None:
        type_ = preset[0] if preset else ("redirect" if url is not None else "oidc")
    type_ = type_.lower()
    key = f"{PROVIDERS}.{id_}"
    if type_ not in ("oidc", "redirect"):
        warn(f"Sign-in provider '{id_}' is skipped: its type '{type_}' is neither oidc nor redirect ({key}.type).")
        return None
    p: dict[str, Any] = {"id": id_, "type": type_}
    label = _blank(i.label)
    p["label"] = label if label is not None else (preset[1] if preset else humanize(id_))
    p["icon"] = _icon(i.icon, preset, id_, warn)
    platforms = _platforms(i.platforms, id_, warn)
    if type_ == "oidc":
        issuer = _blank(i.issuer)
        if issuer is None and preset:
            issuer = preset[3]
            tenant = _blank(i.tenant)
            if lower_id == "microsoft":
                issuer = MICROSOFT_ISSUER.format(tenant if tenant is not None else "common")
            elif lower_id == "entra" and tenant is not None:
                issuer = MICROSOFT_ISSUER.format(tenant)
        client_id = _blank(i.client_id)
        if issuer is None or client_id is None:
            warn(
                f"Sign-in provider '{id_}' is skipped: an oidc provider needs an issuer and a client id "
                f"({key}.issuer, {key}.client-id)."
            )
            return None
        if not _HTTP_URL.match(issuer):
            warn(f"Sign-in provider '{id_}' is skipped: its issuer must be an http(s) URL ({key}.issuer).")
            return None
        p["issuer"] = issuer
        p["clientId"] = client_id
        scopes: list[str] = []
        for scope in i.scopes or []:
            for s in _split(scope):
                if s not in scopes:
                    scopes.append(s)
        p["scopes"] = scopes or list(DEFAULT_SCOPES)
        audience = _blank(i.audience)
        if audience is not None:
            p["audience"] = audience
        p["platforms"] = (
            platforms if platforms is not None else list(preset[4]) if preset and preset[4] else list(_ALL_PLATFORMS)
        )
    else:
        if url is None and preset:
            url = f"/oauth2/authorization/{id_}"
        if url is None or not _usable_url(url):
            warn(
                f"Sign-in provider '{id_}' is skipped: a redirect provider needs a url, a path of this site "
                f"or an http(s) URL ({key}.url)."
            )
            return None
        p["url"] = url
        if i.continue_param is False:
            p["continueParam"] = False
        p["platforms"] = platforms if platforms is not None else list(_WEB_ONLY)
    return p


def providers(
    settings: Callable[[str], str | None],
    supplied: Supplied,
    declared: Mapping[str, Any] | None,
    warn: Callable[[str], None],
) -> list[dict[str, Any]]:
    ids = _split(settings(PROVIDERS))
    if ids:
        inputs = [_from_settings(id_, settings) for id_ in ids]
    elif supplied.providers:
        inputs = [_from_code(p) for p in supplied.providers]
    else:
        legacy = _legacy(settings, declared)
        inputs = [legacy] if legacy else []
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for i in inputs:
        if i.id is None or not _ID.fullmatch(i.id):
            warn(f"Sign-in provider '{i.id}' is skipped: an id is letters, digits, '-' and '_' only.")
            continue
        if i.id in seen:
            warn(f"Sign-in provider '{i.id}' is declared twice: the first one wins.")
            continue
        seen.add(i.id)
        resolved = _resolve(i, warn)
        if resolved is not None:
            out.append(resolved)
    return out


def _login_on_start(settings, supplied: Supplied, warn) -> bool:
    setting = _blank(settings(LOGIN_ON_START))
    if setting is not None:
        if setting.lower() == "true":
            return True
        if setting.lower() == "false":
            return False
        warn(f"Sign-in: {LOGIN_ON_START} is neither true nor false; it stays true.")
    return supplied.login_on_start is None or bool(supplied.login_on_start)


def auth_block(
    settings: Callable[[str], str | None] | None = None,
    supplied: Supplied | None = None,
    declared: Mapping[str, Any] | None = None,
    warn: Callable[[str], None] | None = None,
) -> dict[str, Any] | None:
    """The ``auth`` block (wire order, absent members omitted), or None when there is no provider.
    Defaults: the environment, what ``add_mateu`` configured, WARN once per message."""
    settings = settings or env_settings
    supplied = supplied if supplied is not None else _configured
    warn = warn or _warn_once
    found = providers(settings, supplied, declared, warn)
    if not found:
        return None
    auth: dict[str, Any] = {}
    first = next((p for p in found if p["type"] == "oidc" and "mobile" in p["platforms"]), None)
    if first is not None:
        auth["type"] = "oidc"
        auth["issuer"] = first["issuer"]
        auth["clientId"] = first["clientId"]
        auth["scopes"] = first["scopes"]
        if first.get("audience") is not None:
            auth["audience"] = first["audience"]
    auth["loginOnStart"] = _login_on_start(settings, supplied, warn)
    auth["providers"] = found
    logout_url = _blank(settings(LOGOUT_URL)) or _blank(supplied.logout_url)
    if logout_url is not None:
        if _usable_url(logout_url):
            auth["logoutUrl"] = logout_url
        else:
            warn(f"Sign-in: {LOGOUT_URL} is ignored: it must be a path of this site or an http(s) URL.")
    return auth


def web_block(auth: Mapping[str, Any] | None) -> dict[str, Any] | None:
    """What the WEB clients get: only the providers offered on the web; None when none."""
    if auth is None:
        return None
    web = [p for p in auth["providers"] if "web" in p["platforms"]]
    if not web:
        return None
    block: dict[str, Any] = {"loginOnStart": auth["loginOnStart"], "providers": web}
    if auth.get("logoutUrl") is not None:
        block["logoutUrl"] = auth["logoutUrl"]
    return block


def to_json(value: Any) -> str:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False)


def html_escape(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def meta(auth: Mapping[str, Any] | None) -> str | None:
    """The ``<meta name="mateu-auth">`` tag for ``auth``, or None when no web provider."""
    web = web_block(auth)
    if web is None:
        return None
    return f'<meta name="{META_NAME}" content="{html_escape(to_json(web))}">'


def head(html: str, declared: Mapping[str, Any] | None = None) -> str:
    """``html`` with the ``<meta name="mateu-auth">`` before ``</head>``, when any."""
    if not html or "</head>" not in html or f'name="{META_NAME}"' in html:
        return html
    tag = meta(auth_block(declared=declared))
    return html if tag is None else html.replace("</head>", tag + "</head>", 1)


def warn_on_startup() -> None:
    """Resolves the declared providers once, so an unusable one is reported when the app starts."""
    try:
        auth_block()
    except Exception as e:  # noqa: BLE001 — a startup check never breaks the app
        log.warning("Sign-in providers could not be read: %s", e)
