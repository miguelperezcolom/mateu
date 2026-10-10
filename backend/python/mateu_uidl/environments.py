"""Deployment environments for the REST source catalogue (the Python mirror of Java's
``io.mateu.uidl.data.Environment``)."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class SourceOverride:
    """What an environment may change about a catalogue entry — its DEPLOYMENT, never its contract
    (method, body, paths and field mapping stay as authored).

    ``base_url`` replaces the ORIGIN of the entry's url (keeping its path and query; a relative url
    gets it prepended); ``url`` replaces the whole url (wins over ``base_url``); ``headers`` merge
    over the entry's (use ``${secret.X}`` for credentials, never a literal); ``proxy`` replaces the
    flag when set."""

    base_url: str | None = None
    url: str | None = None
    headers: dict[str, str] = field(default_factory=dict)
    proxy: bool | None = None


@dataclass(frozen=True)
class Environment:
    """A named set of per-source overrides (``type: Environment`` /
    ``specs/ui/environments/<name>.yaml``), activated with ``MATEU_ENVIRONMENT``. Never put a secret
    in one."""

    name: str
    sources: dict[str, SourceOverride] = field(default_factory=dict)


__all__ = ["Environment", "SourceOverride"]
