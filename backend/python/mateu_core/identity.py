"""Identity — the default identity provider ``add_mateu`` installs.

Roles are derived ONLY from a trusted source — the same rule as Java's ``IdentityResolver``:

1. the principal the hosting framework authenticated (``MateuRequest.principal`` — the FastAPI
   adapter fills it from Starlette's ``AuthenticationMiddleware``: ``request.user`` +
   ``request.auth.scopes``);
2. the Bearer JWT, VERIFIED with PyJWT: against ``key`` when one is passed, else against the
   configuration in the environment —

   - ``MATEU_SECURITY_JWT_JWKS_URI`` (RS*/ES* tokens, keys fetched and cached by ``PyJWKClient``),
   - ``MATEU_SECURITY_JWT_SECRET`` (HS* tokens — development / tests),
   - ``MATEU_SECURITY_JWT_ISSUER`` / ``MATEU_SECURITY_JWT_AUDIENCE`` (checked when set);

   ``exp`` is required, ``nbf`` honoured. A token that fails is no identity at all;
3. ONLY with ``MATEU_SECURITY_TRUST_UNVERIFIED_TOKENS=true`` (local development, never the
   default): the token's claims, unverified;
4. otherwise: no identity — every ``EyesOnly``/``ReadOnlyUnless``/``DisabledUnless`` gate denies.

Claims are read provider-agnostically (mirrors Java's ``CallerIdentities``):

- **roles** — Keycloak ``realm_access.roles`` + ``resource_access.*.roles``, plus a top-level
  ``roles`` claim (Okta / Azure AD / generic OIDC);
- **groups** — ``groups``;
- **scopes** — the space-delimited ``scope`` claim, or the ``scp`` array (Azure AD);
- **permissions** — ``permissions``.

PyJWT is an optional extra (``pip install mateu-ui[jwt]``; JWKS needs ``cryptography`` too).
Without it no token can be verified, so none is trusted — and it says so once in the log.
"""

from __future__ import annotations

import logging
import os
from collections.abc import Callable, Iterable, Sequence
from typing import Any

from mateu_uidl import Identity

from .request_context import bearer_token, current_request

log = logging.getLogger("mateu.identity")

#: Environment settings (the Python spelling of Java's ``mateu.security.*`` keys).
JWKS_URI_ENV = "MATEU_SECURITY_JWT_JWKS_URI"
SECRET_ENV = "MATEU_SECURITY_JWT_SECRET"
ISSUER_ENV = "MATEU_SECURITY_JWT_ISSUER"
AUDIENCE_ENV = "MATEU_SECURITY_JWT_AUDIENCE"
TRUST_UNVERIFIED_ENV = "MATEU_SECURITY_TRUST_UNVERIFIED_TOKENS"

_HMAC = ("HS256", "HS384", "HS512")
_ASYMMETRIC = ("RS256", "RS384", "RS512", "ES256", "ES384", "ES512")

_warned: set[str] = set()


def _warn_once(key: str, message: str) -> None:
    if key not in _warned:
        _warned.add(key)
        log.warning(message)


def _env(name: str) -> str | None:
    value = os.environ.get(name)
    return value.strip() if value and value.strip() else None


def trusts_unverified_tokens() -> bool:
    """Whether the local-development opt-out is on."""
    return (_env(TRUST_UNVERIFIED_ENV) or "").lower() == "true"


def verification_configured() -> bool:
    """Whether a JWKS uri or a secret is configured in the environment."""
    return _env(JWKS_URI_ENV) is not None or _env(SECRET_ENV) is not None


def _as_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [v for v in value.split(" ") if v]
    if isinstance(value, Iterable):
        return [str(v) for v in value]
    return [str(value)]


def identity_from_claims(claims: dict[str, Any]) -> Identity:
    """Map VERIFIED JWT claims onto an ``Identity`` (mirrors Java's ``CallerIdentities``)."""
    roles: list[str] = []
    realm = claims.get("realm_access")
    if isinstance(realm, dict):
        roles += _as_list(realm.get("roles"))
    resources = claims.get("resource_access")
    if isinstance(resources, dict):
        for client in resources.values():
            if isinstance(client, dict):
                roles += _as_list(client.get("roles"))
    roles += _as_list(claims.get("roles"))
    scope = claims.get("scope")
    scopes = _as_list(scope) if isinstance(scope, str) else _as_list(claims.get("scp", scope))
    return Identity(
        roles=tuple(dict.fromkeys(roles)),
        groups=tuple(_as_list(claims.get("groups"))),
        scopes=tuple(scopes),
        permissions=tuple(_as_list(claims.get("permissions"))),
    )


def _unverified_claims(token: str) -> dict[str, Any]:
    import base64
    import json

    try:
        payload = token.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        claims = json.loads(base64.urlsafe_b64decode(payload.encode()))
        return claims if isinstance(claims, dict) else {}
    except Exception:  # noqa: BLE001 - garbage is "no identity", never a 500
        return {}


_UNVERIFIED_BOX = (
    "\n*******************************************************************************\n"
    f"* Mateu: {TRUST_UNVERIFIED_ENV}=true\n"
    "* Bearer tokens are read WITHOUT verifying their signature. Anyone can forge the\n"
    "* roles that drive EyesOnly / ReadOnlyUnless / DisabledUnless.\n"
    "* LOCAL DEVELOPMENT ONLY — never enable it in a deployed environment.\n"
    "*******************************************************************************"
)

_UNCONFIGURED_BOX = (
    "\n*******************************************************************************\n"
    "* Mateu: NO TOKEN VERIFIER IS CONFIGURED.\n"
    "* Roles come only from a principal your app authenticated (Starlette\n"
    "* AuthenticationMiddleware) or from add_mateu(identity_provider=...). Bearer tokens are\n"
    "* NOT trusted on their own: without one of those every EyesOnly / ReadOnlyUnless /\n"
    "* DisabledUnless element stays hidden or denied.\n"
    f"* Set {JWKS_URI_ENV} (+ {ISSUER_ENV}, {AUDIENCE_ENV}), or {SECRET_ENV}\n"
    "* for HS256 in development, or pass jwt_identity_provider(key=...).\n"
    "*******************************************************************************"
)


def warn_on_startup(key_configured: bool = False) -> None:
    """Logs, once, what this configuration means for restricted UI (called by ``add_mateu``)."""
    if trusts_unverified_tokens():
        _warn_once("unverified", _UNVERIFIED_BOX)
    elif not key_configured and not verification_configured():
        _warn_once("unconfigured", _UNCONFIGURED_BOX)


def jwt_identity_provider(
    key: Any = None,
    algorithms: Sequence[str] | None = None,
    audience: str | None = None,
    issuer: str | None = None,
    jwks_uri: str | None = None,
) -> Callable[[], Identity | None]:
    """A parameterless identity provider for the request in flight.

    ``key`` — the verification key (a PEM public key, an HS secret, or a ``PyJWK``); ``jwks_uri``
    — a JWKS endpoint. Without either the environment is read (see the module docstring); with
    nothing configured a token is NOT trusted (unless the development opt-out is on). The
    principal the framework authenticated always wins over the token."""

    jwks_client_holder: dict[str, Any] = {}

    def verified_claims(token: str, jwt: Any) -> dict[str, Any] | None:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg")
        aud = audience if audience is not None else _env(AUDIENCE_ENV)
        iss = issuer if issuer is not None else _env(ISSUER_ENV)
        options = {"require": ["exp"], "verify_aud": aud is not None}
        if key is not None:
            allowed = list(algorithms) if algorithms else list(_HMAC + _ASYMMETRIC)
            verify_key = key
        else:
            uri = jwks_uri or _env(JWKS_URI_ENV)
            secret = _env(SECRET_ENV)
            if alg in _HMAC and secret is not None:
                allowed, verify_key = list(_HMAC), secret
            elif alg in _ASYMMETRIC and uri is not None:
                client = jwks_client_holder.get(uri)
                if client is None:
                    client = jwt.PyJWKClient(uri, cache_keys=True)
                    jwks_client_holder[uri] = client
                allowed, verify_key = list(_ASYMMETRIC), client.get_signing_key_from_jwt(token).key
            else:
                return None  # "none", an HMAC token without a secret, an RSA one without JWKS…
        if alg not in allowed:
            return None
        claims = jwt.decode(
            token, verify_key, algorithms=allowed, audience=aud, issuer=iss, options=options, leeway=30
        )
        return claims if isinstance(claims, dict) else {}

    def provide() -> Identity | None:
        rq = current_request()
        if rq is not None and rq.principal is not None:
            return rq.principal
        token = bearer_token()
        if token is None:
            return None
        if key is None and jwks_uri is None and not verification_configured():
            if trusts_unverified_tokens():
                _warn_once("unverified", _UNVERIFIED_BOX)
                return identity_from_claims(_unverified_claims(token))
            _warn_once(
                "token-ignored",
                "A Bearer token arrived, but nothing can VERIFY it, so it is ignored and the caller "
                "has no roles: restricted UI stays hidden/denied. Configure "
                f"{JWKS_URI_ENV} or {SECRET_ENV}, pass jwt_identity_provider(key=...), or "
                "authenticate the request in your app (Starlette AuthenticationMiddleware).",
            )
            return None
        try:
            import jwt  # PyJWT, optional extra
        except ImportError:
            _warn_once(
                "pyjwt",
                "A Bearer token arrived but PyJWT is not installed (pip install mateu-ui[jwt]): it "
                "cannot be verified, so no identity is resolved and every EyesOnly/ReadOnlyUnless/"
                "DisabledUnless gate denies.",
            )
            return None
        try:
            claims = verified_claims(token, jwt)
        except Exception as e:  # noqa: BLE001 - any invalid token is "no identity", never a 500
            log.info("Ignoring an invalid Bearer token: %s", e)
            return None
        return identity_from_claims(claims) if claims is not None else None

    return provide


__all__ = [
    "identity_from_claims",
    "jwt_identity_provider",
    "trusts_unverified_tokens",
    "verification_configured",
    "warn_on_startup",
]
