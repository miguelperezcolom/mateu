"""The signed-in user the header's user menu shows (EXPERIMENTAL).

Java's ``io.mateu.core.infra.security.UserProfiles``, .NET's ``Mateu.Core.UserProfiles`` — same
rules. Only for a caller with an identity (a non-blank ``Identity.name``); then the app's
``UserProfileSupplier``\\ s first (``add_mateu(user_profile_suppliers=[...])``), else what the
identity's claims say about the person:

- name: ``name``, else ``given_name`` + ``family_name``, else ``preferred_username``, ``login``
  (GitHub), ``nickname``, else the identity's name;
- email: ``email``;
- picture: ``picture`` (OIDC), else ``avatar_url`` (GitHub) — http(s) only.

Blank values count as absent. Display only: nothing here grants or denies.
"""

from __future__ import annotations

import logging
from collections.abc import Iterable, Mapping
from typing import Any

from mateu_ui.uidl.security import Identity
from mateu_ui.uidl.user_profile import UserProfile, UserProfileSupplier

log = logging.getLogger("mateu.user_profiles")


def profile_of(
    identity: Identity | None, suppliers: Iterable[UserProfileSupplier] = ()
) -> UserProfile | None:
    """The signed-in user, or None for an anonymous caller."""
    if identity is None or identity.name is None or not str(identity.name).strip():
        return None
    for supplier in suppliers or ():
        try:
            supplied = supplier.profile(identity)
        except Exception as e:  # noqa: BLE001 - a broken directory leaves the defaults
            log.warning("UserProfileSupplier %s failed: %r", type(supplier).__qualname__, e)
            continue
        if supplied is not None:
            return supplied
    return from_claims(identity.claims or {}, identity.name)


def from_claims(claims: Mapping[str, Any], fallback_name: str) -> UserProfile:
    """What the claims say about the person; ``fallback_name`` when they name nobody."""
    name = _text(claims, "name")
    if name is None:
        given = _text(claims, "given_name")
        family = _text(claims, "family_name")
        if given is not None or family is not None:
            name = ((given or "") + " " + (family or "")).strip()
    for key in ("preferred_username", "login", "nickname"):
        if name is None:
            name = _text(claims, key)
    if name is None:
        name = fallback_name
    picture = _text(claims, "picture")
    if not _is_http(picture):
        picture = _text(claims, "avatar_url")
    return UserProfile(name, _text(claims, "email"), picture if _is_http(picture) else None)


def _text(claims: Mapping[str, Any], key: str) -> str | None:
    value = claims.get(key)
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _is_http(url: str | None) -> bool:
    return url is not None and (url.startswith("https://") or url.startswith("http://"))


__all__ = ["from_claims", "profile_of"]
