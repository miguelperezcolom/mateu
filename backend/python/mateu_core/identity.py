"""Identity — who the caller is, for ``EyesOnly`` / ``ReadOnlyUnless`` / ``DisabledUnless``.

Mateu does NOT authenticate: it reads the identity the application already established — the same
rule as Java's ``IdentityResolver``. The default provider ``add_mateu`` installs
(``framework_identity_provider()``) takes it, in order, from:

1. ``request.state.mateu_identity`` — an ``Identity`` the app's own dependency or middleware set
   after authenticating the request;
2. Starlette's ``AuthenticationMiddleware`` — ``request.user`` (its ``roles`` / ``groups`` /
   ``permissions`` attributes) and ``request.auth.scopes``;
3. otherwise nobody: every gate with a declared dimension denies.

A Bearer token is never decoded here — its payload is the client's to write. To use your token's
claims, verify it in your app (a FastAPI dependency, a middleware) and hand Mateu the result,
e.g. ``request.state.mateu_identity = identity_from_claims(verified_claims)``, or pass
``add_mateu(identity_provider=...)``.
"""

from __future__ import annotations

import logging
from collections.abc import Callable, Iterable
from typing import Any

from mateu_uidl import Identity

from .request_context import current_request

log = logging.getLogger("mateu.identity")

_warned = False


def _as_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [v for v in value.split(" ") if v]
    if isinstance(value, Iterable):
        return [str(v) for v in value]
    return [str(value)]


def identity_from_claims(claims: dict[str, Any]) -> Identity:
    """Map the claims of a token YOUR APP verified onto an ``Identity`` (mirrors Java's
    ``CallerIdentities.fromClaims``): Keycloak ``realm_access``/``resource_access`` roles plus a
    top-level ``roles``, ``groups``, ``scope``/``scp`` and ``permissions``."""
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


def warn_on_startup() -> None:
    """Logs, once, that Mateu takes roles only from what the app authenticated."""
    global _warned
    if not _warned:
        _warned = True
        log.warning(
            "Mateu does not authenticate: EyesOnly / ReadOnlyUnless / DisabledUnless match the "
            "identity your app established — request.state.mateu_identity, or Starlette's "
            "AuthenticationMiddleware (request.user + request.auth.scopes). Without one, restricted "
            "UI stays hidden for everyone."
        )


def framework_identity_provider() -> Callable[[], Identity | None]:
    """The default identity provider: the identity the app authenticated for the request in
    flight (see the module docstring), or None."""

    def provide() -> Identity | None:
        rq = current_request()
        return rq.principal if rq is not None else None

    return provide


__all__ = ["framework_identity_provider", "identity_from_claims", "warn_on_startup"]
