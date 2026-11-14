"""The signed-in user the app's header shows in its user menu (EXPERIMENTAL).

Mirrors Java's ``io.mateu.uidl.security.UserProfile`` / ``UserProfileSupplier`` and .NET's
``UserProfile`` / ``IUserProfileSupplier``. Display only: never an input to access control, which
reads :class:`~mateu_ui.uidl.Identity`.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from .security import Identity


@dataclass(frozen=True)
class UserProfile:
    """The signed-in user as the app's header shows them: the user menu (avatar or initials, the
    name, and Sign out inside it). ``name`` is required (never blank); a blank ``email`` or
    ``picture`` is none. ``picture`` is an http(s) URL of the user's picture (initials are drawn
    without one). EXPERIMENTAL."""

    name: str
    email: str | None = None
    picture: str | None = None

    def __post_init__(self) -> None:
        if self.name is None or not str(self.name).strip():
            raise ValueError("A user profile needs a name to show")
        if self.email is not None and not str(self.email).strip():
            object.__setattr__(self, "email", None)
        if self.picture is not None and not str(self.picture).strip():
            object.__setattr__(self, "picture", None)

    @staticmethod
    def named(name: str) -> "UserProfile":
        """A user known by name only."""
        return UserProfile(name)


class UserProfileSupplier(ABC):
    """Says how the signed-in user is shown in the app's header (name, e-mail, picture). Pass one
    to ``add_mateu(user_profile_suppliers=[...])`` when the defaults are not what you want — Mateu
    otherwise reads them off the identity your app authenticated: the ``name``, ``email`` and
    ``picture`` claims (GitHub: ``name``, ``avatar_url``), else the identity's name.

    Consulted only for a caller with an identity, in order (the first non-None answer wins); return
    None to fall back to the defaults. A supplier that raises is logged and skipped. Display only:
    it never grants or denies anything. EXPERIMENTAL."""

    @abstractmethod
    def profile(self, identity: Identity) -> UserProfile | None:  # pragma: no cover
        ...


__all__ = ["UserProfile", "UserProfileSupplier"]
