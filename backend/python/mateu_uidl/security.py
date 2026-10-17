"""Identity and access gates: EyesOnly / ReadOnlyUnless / DisabledUnless and the audience projection."""

from __future__ import annotations

from dataclasses import dataclass, fields

_DIMENSIONS = ("roles", "groups", "scopes", "permissions")


def _names(value, dimension: str) -> tuple[str, ...]:
    """One identity dimension as a tuple of names: a single string is ONE name (``"admin"`` →
    ``("admin",)``, never ``('a', 'd', 'm', 'i', 'n')``), any other iterable of strings is taken
    as is, and anything else is rejected — a gate that silently matched nobody is the worst
    failure mode, because "fixing" it usually means removing it."""
    if value is None:
        return ()
    if isinstance(value, str):
        return (value,)
    try:
        names = tuple(value)
    except TypeError:
        raise TypeError(
            f"{dimension} must be a string or an iterable of strings, got {type(value).__name__}"
        ) from None
    for name in names:
        if not isinstance(name, str):
            raise TypeError(
                f"{dimension} must contain only strings, got {type(name).__name__} ({name!r})"
            )
    return names


class _Dimensions:
    """Normalises the four dimensions of a frozen gate dataclass on construction."""

    def __post_init__(self) -> None:
        for f in fields(self):  # type: ignore[arg-type]
            if f.name in _DIMENSIONS:
                object.__setattr__(self, f.name, _names(getattr(self, f.name), f.name))


@dataclass(frozen=True)
class Identity(_Dimensions):
    """The caller's identity, as the framework adapter resolves it (e.g. from the JWT Bearer
    token): the dimensions EyesOnly/ReadOnlyUnless/DisabledUnless match against. The Python
    analogue of what Java's Authorizer reads."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()


@dataclass(frozen=True)
class EyesOnly(_Dimensions):
    """HIDES the field (form and listing columns) unless the caller is authorized. Matching is
    AND across declared dimensions, OR within each; nothing declared → unrestricted; no identity
    → unauthorized. The Python analogue of Java's ``@EyesOnly`` on fields."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()


@dataclass(frozen=True)
class ReadOnlyUnless(_Dimensions):
    """The field is READ-ONLY unless the caller is authorized. Composes with ``EyesOnly()`` for
    layered access. The Python analogue of Java's ``@ReadOnlyUnless``."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()


@dataclass(frozen=True)
class DisabledUnless(_Dimensions):
    """The field (or a ``@button`` method, via ``disabled_unless``) is DISABLED unless the
    caller is authorized. The Python analogue of Java's ``@DisabledUnless``."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()


def eyes_only(roles=(), groups=(), scopes=(), permissions=()):
    """Class- or method-level ``EyesOnly`` (Java's ``@EyesOnly`` on a type or a method).

    On a CLASS the whole view is for the authorized only: a request naming it (by route or by
    server-side type) is refused with 403, and menu entries leading to it are hidden. On a METHOD
    (a ``@button``, ``@action``, ``@menu_item``…) the button / menu entry is hidden and invoking it
    is refused. Same matching as the field marker: AND across declared dimensions, OR within each;
    no identity → unauthorized."""

    gate = EyesOnly(roles=roles, groups=groups, scopes=scopes, permissions=permissions)

    def deco(target):
        target.__mateu_eyes_only__ = gate
        return target

    return deco


def disabled_unless(roles=(), groups=(), scopes=(), permissions=()):
    """Method decorator: the button is disabled unless the caller is authorized."""

    def deco(fn):
        fn.__mateu_disabled_unless__ = DisabledUnless(
            roles=roles, groups=groups, scopes=scopes, permissions=permissions
        )
        return fn

    return deco


class Audience:
    """PERSONA PROJECTION: the field is shown only when the CURRENT AUDIENCE — the app-state
    value under the ``"audience"`` key, i.e. the ``@app_context`` selector named audience — is
    unset (no projection active → everything visible) or is one of the declared values
    (case-sensitive). NOT a security boundary (the data still travels to any client that clears
    the selector) — a UX projection aid; combine with ``EyesOnly()`` for real access control.
    The Python analogue of Java's ``@Audience``. On ``@button``/``@menu_item`` methods use the
    ``audience(...)`` decorator instead."""

    def __init__(self, *audiences: str):
        self.audiences = tuple(audiences)


def audience(*audiences: str):
    """Method decorator: the ``@button``/``@menu_item`` entry is shown only when the current
    audience is unset or one of ``audiences`` (the method-level form of ``Audience(...)``)."""

    def deco(fn):
        fn.__mateu_audience__ = Audience(*audiences)
        return fn

    return deco


@dataclass(frozen=True)
class Access(_Dimensions):
    """An identity restriction authored as DATA — the YAML twin of ``EyesOnly`` /
    ``ReadOnlyUnless`` / ``DisabledUnless``, with the same four dimensions and the SAME matching
    (evaluated by the mapper's ``authorized``, the one rule behind the markers): AND across declared
    dimensions, OR within one; nothing declared → unrestricted; no identity → denied.

    Where it is authored (mirrors Java's ``io.mateu.uidl.data.Access``):

    - ``access:`` on a ``routes.yaml`` entry — the route and every route nested under it answer 403;
    - ``access:`` on a declared ``actions:`` entry — not advertised, buttons naming it disabled, 403
      if invoked anyway;
    - ``eyesOnly:`` / ``readOnlyUnless:`` / ``disabledUnless:`` on any component of a definition —
      removed / read-only / disabled.

    A string or a list is the roles shorthand (``access: admin``, ``access: [admin, hr]``)."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()

    def restricts(self) -> bool:
        """Whether any dimension is declared (named so it does not read as a property)."""
        return bool(self.roles or self.groups or self.scopes or self.permissions)
