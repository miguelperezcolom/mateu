"""Identity from a Bearer JWT — the default identity provider ``add_mateu`` installs.

The Python mirror of Java's ``io.mateu.core.domain.Authorizer`` claim extraction, provider-agnostic:

- **roles** — Keycloak ``realm_access.roles`` + ``resource_access.*.roles``, plus a top-level
  ``roles`` claim (Okta / Azure AD / generic OIDC);
- **groups** — ``groups``;
- **scopes** — the space-delimited ``scope`` claim, or the ``scp`` array (Azure AD);
- **permissions** — ``permissions``.

Verification. With a ``key`` the token's signature (and expiry) is VERIFIED with PyJWT and a token
that fails is no identity at all. Without one the claims are read unverified — exactly what Java's
``Authorizer`` does, which assumes something upstream (an API gateway, an auth middleware, Spring
Security on the Java side) already verified the token. Do NOT run the keyless mode on an endpoint
reachable without such a verifier: anyone could then mint their own roles.

PyJWT is an optional extra (``pip install mateu-ui[jwt]``). Without it the provider resolves no
identity — every gated element stays denied — and says so once in the log.
"""

from __future__ import annotations

import logging
from collections.abc import Callable, Iterable, Sequence
from typing import Any

from mateu_uidl import Identity

from .request_context import bearer_token

log = logging.getLogger("mateu.identity")

_warned_missing_pyjwt = False


def _as_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [v for v in value.split(" ") if v]
    if isinstance(value, Iterable):
        return [str(v) for v in value]
    return [str(value)]


def identity_from_claims(claims: dict[str, Any]) -> Identity:
    """Map JWT claims onto an ``Identity`` (mirrors ``Authorizer.extractRoles``/``extractScopes``)."""
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


def jwt_identity_provider(
    key: Any = None,
    algorithms: Sequence[str] = ("RS256", "ES256", "HS256"),
    audience: str | None = None,
    issuer: str | None = None,
) -> Callable[[], Identity | None]:
    """A parameterless identity provider reading the Bearer JWT of the request in flight.

    ``key`` — the verification key (a PEM public key, an HS secret, or a ``PyJWK``); None reads the
    claims unverified (see the module docstring for when that is acceptable)."""

    def provide() -> Identity | None:
        global _warned_missing_pyjwt
        token = bearer_token()
        if token is None:
            return None
        try:
            import jwt  # PyJWT, optional extra
        except ImportError:
            if not _warned_missing_pyjwt:
                _warned_missing_pyjwt = True
                log.warning(
                    "A Bearer token arrived but PyJWT is not installed (pip install mateu-ui[jwt]): "
                    "no identity is resolved, so every EyesOnly/ReadOnlyUnless/DisabledUnless gate "
                    "denies. Install it or pass add_mateu(identity_provider=...)."
                )
            return None
        try:
            if key is None:
                claims = jwt.decode(token, options={"verify_signature": False})
            else:
                claims = jwt.decode(
                    token,
                    key,
                    algorithms=list(algorithms),
                    audience=audience,
                    issuer=issuer,
                    options={"verify_aud": audience is not None},
                )
        except Exception as e:  # noqa: BLE001 - any invalid token is "no identity", never a 500
            log.warning("Ignoring an invalid Bearer token: %s", e)
            return None
        return identity_from_claims(claims if isinstance(claims, dict) else {})

    return provide


__all__ = ["identity_from_claims", "jwt_identity_provider"]
