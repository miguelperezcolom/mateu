"""Translation catalogues for YAML apps (the Python mirror of Java's ``Translations`` record and
``TranslationsSupplier`` interface)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Translations:
    """One locale's message catalogue. Authored as a ``type: Translations`` file under ``specs/ui``
    (or ``specs/ui/translations/<locale>.yaml``, where the file name is the locale); nested maps are
    flattened with dots, so a label says ``${i18n.orders.title}``."""

    locale: str
    messages: dict[str, Any] = field(default_factory=dict)


class TranslationsSupplier:
    """The CODE producer of the translation catalogue (the twin of the ``type: Translations``
    files). Discovered among the sources handed to ``MateuRegistry`` and instantiated with no
    arguments; its messages are merged UNDER the authored files — authored wins per key."""

    def translations(self) -> list[Translations]:
        raise NotImplementedError


__all__ = ["Translations", "TranslationsSupplier"]
