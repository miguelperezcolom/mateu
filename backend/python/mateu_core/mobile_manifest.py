"""The UI manifest the generic Mateu mobile app reads (``GET <base>/mateu/v3/manifest``) — EXPERIMENTAL
(mobile app, 3.0 beta). Mirrors Java's ``MobileManifest`` and .NET's ``MobileManifest``: the same
members, order, fallbacks and settings, so the three backends answer byte for byte the same JSON.

Public and cacheable: it says what the app is called, its icon and colour, which wire it speaks and,
optionally, which OpenID Connect provider the host application trusts. Mateu never authenticates or
validates tokens; ``auth`` only TELLS the client where to sign in.

Resolution, highest precedence first: the ``MATEU_MOBILE_*`` environment variables, then
``@mobile_app(...)`` on the app class, then the app itself (its ``@app`` title, humanized class name).
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

from .naming import humanize

#: Where the manifest is served under a base url.
PATH = "/mateu/v3/manifest"

WIRE_VERSION = "3"
DEFAULT_MIN_APP_VERSION = "1.0.0"
DEFAULT_SCOPES = ["openid", "profile"]

HEADERS = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
}


def _setting(name: str) -> str | None:
    value = os.environ.get(name)
    if value is None or not value.strip():
        return None
    return value.strip()


def _blank_to_none(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def manifest(app_type: type | None) -> dict[str, Any]:
    """The manifest of ``app_type`` (the ``@app`` class; None → a nameless "Mateu" app), as an
    ordered dict whose absent members are omitted (never null)."""
    declared: dict[str, Any] = (getattr(app_type, "__mateu_mobile_app__", None) or {}) if app_type else {}

    def pick(env: str, key: str) -> str | None:
        return _setting(env) or _blank_to_none(declared.get(key))

    app_title = _blank_to_none(getattr(app_type, "__mateu_app__", None)) if app_type else None
    name = (
        pick("MATEU_MOBILE_NAME", "name")
        or app_title
        or (humanize(app_type.__name__) if app_type else "Mateu")
    )
    out: dict[str, Any] = {"name": name, "shortName": pick("MATEU_MOBILE_SHORT_NAME", "short_name") or name}
    # The Python port has no app logo / favicon / accent colour: icon and theme colour come only
    # from the settings or @mobile_app (Java falls back to @Logo/@FavIcon and @App(accentColor)).
    icon = pick("MATEU_MOBILE_ICON", "icon")
    if icon:
        out["icon"] = icon
    theme_color = pick("MATEU_MOBILE_THEME_COLOR", "theme_color")
    if theme_color:
        out["themeColor"] = theme_color
    out["wireVersion"] = WIRE_VERSION
    out["minAppVersion"] = pick("MATEU_MOBILE_MIN_APP_VERSION", "min_app_version") or DEFAULT_MIN_APP_VERSION
    issuer = pick("MATEU_MOBILE_OIDC_ISSUER", "oidc_issuer")
    client_id = pick("MATEU_MOBILE_OIDC_CLIENT_ID", "oidc_client_id")
    if issuer and client_id:
        configured = _setting("MATEU_MOBILE_OIDC_SCOPES")
        if configured:
            scopes = [s for s in re.split(r"[,\s]+", configured) if s]
        else:
            scopes = [s.strip() for s in declared.get("scopes", []) if s and s.strip()]
        out["auth"] = {
            "type": "oidc",
            "issuer": issuer,
            "clientId": client_id,
            "scopes": scopes or list(DEFAULT_SCOPES),
        }
    return out


def manifest_json(app_type: type | None) -> str:
    """The compact JSON body (no spaces, members in the spec's order)."""
    return json.dumps(manifest(app_type), separators=(",", ":"), ensure_ascii=False)
