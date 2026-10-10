"""The app's translation catalogue — the Python mirror of Java's ``TranslationRegistry``.

Two producers, one catalogue: :class:`~mateu_uidl.TranslationsSupplier` classes (the CODE half,
discovered by ``MateuRegistry``) and the ``type: Translations`` files under the specs directory
(plus the ``translations/<locale>.yaml`` convention) — the AUTHORED half, merged on top key by key:
authored wins.

Texts reference a message as ``${i18n.orders.title}``. It is resolved on the SERVER, per request,
for the request's locale (:func:`locale_of`), so the wire carries finished text. Lookup: the exact
locale (``es-ES``), its language (``es``), the fallback locale (``MATEU_I18N_FALLBACK``, default
``en``), then the key itself — with ONE warning per (locale, key).
"""

from __future__ import annotations

import logging
import os
import re
import threading
from pathlib import Path
from typing import Any

import yaml

from mateu_uidl import Translations

from . import request_context

log = logging.getLogger("mateu.i18n")

#: The ``${i18n.key}`` expression, anywhere inside a text.
EXPRESSION = re.compile(r"\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.\-]*)\s*}")

CONVENTIONAL_DIR = "translations"


def normalize(locale: str | None) -> str:
    return (locale or "").strip().replace("_", "-").lower()


def fallback_locale() -> str:
    configured = (os.environ.get("MATEU_I18N_FALLBACK") or "").strip()
    return configured or "en"


def candidates(locale: str | None) -> list[str]:
    """The locales tried for a request locale, most specific first, de-duplicated."""
    out: list[str] = []
    n = normalize(locale)
    if n:
        out.append(n)
        if "-" in n:
            out.append(n.split("-", 1)[0])
    fb = normalize(fallback_locale())
    if fb and fb not in out:
        out.append(fb)
        if "-" in fb and fb.split("-", 1)[0] not in out:
            out.append(fb.split("-", 1)[0])
    return out


def _flatten(prefix: str, messages: Any, out: dict[str, str]) -> None:
    if not isinstance(messages, dict):
        return
    for key, value in messages.items():
        full = f"{prefix}.{key}" if prefix else str(key)
        if isinstance(value, dict):
            _flatten(full, value, out)
        elif value is not None:
            out[full] = str(value)


def parse(root: Any, relative_path: str | None) -> Translations | None:
    """A parsed file as one locale's catalogue, or None when it is not a translations file.
    ``relative_path`` is relative to the specs directory (posix separators)."""
    if not isinstance(root, dict):
        return None
    kind = root.get("type") or ""
    conventional = relative_path is not None and relative_path.startswith(CONVENTIONAL_DIR + "/")
    if kind != "Translations" and not (conventional and not kind):
        return None
    locale = str(root.get("locale") or "").strip()
    if not locale and relative_path:
        locale = re.sub(r"\.ya?ml$", "", relative_path.rsplit("/", 1)[-1])
    if not locale:
        log.warning("Ignoring translations %s with no locale", relative_path)
        return None
    flat: dict[str, str] = {}
    _flatten("", root.get("messages"), flat)
    return Translations(locale=locale, messages=flat)


def accept_language() -> str | None:
    """The first ``Accept-Language`` tag of the request in flight, or None."""
    header = request_context.header("accept-language")
    if not header or not header.strip():
        return None
    tag = header.split(",")[0].split(";")[0].strip()
    return None if not tag or tag == "*" else tag


def locale_of(mapper=None) -> str | None:
    """The UI language of the request in flight: what the app's ``Translator.locale()`` says (the
    port's locale chain, which also feeds ``AppMetadata.locale``), else the ``Accept-Language``
    header; None when neither says (the fallback locale then applies)."""
    if mapper is not None:
        try:
            locale = mapper._locale()
        except Exception:  # noqa: BLE001 - no locale is a valid answer
            locale = None
        if locale:
            return locale
    return accept_language()


class TranslationRegistry:
    def __init__(self, directory: str | None = None, suppliers: list[type] | None = None) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        self._suppliers = list(suppliers or [])
        self._catalogue: dict[str, dict[str, str]] | None = None
        self._warned: set[str] = set()
        self._lock = threading.Lock()
        from mateu_core import dev_specs

        dev_specs.register(self)

    def invalidate_specs(self) -> None:
        """Dev mode: a spec changed — the catalogue is read again on next use."""
        self.reset()

    def catalogue(self) -> dict[str, dict[str, str]]:
        """locale (lower-case BCP 47) → key → text, loaded once."""
        if self._catalogue is None:
            with self._lock:
                if self._catalogue is None:
                    self._catalogue = self._load()
        return self._catalogue

    def has_translations(self) -> bool:
        return bool(self.catalogue())

    def _load(self) -> dict[str, dict[str, str]]:
        merged: dict[str, dict[str, str]] = {}

        def add(t: Translations) -> None:
            key = normalize(t.locale)
            if not key:
                return
            flat: dict[str, str] = {}
            _flatten("", t.messages, flat)
            merged.setdefault(key, {}).update(flat)

        for supplier in self._suppliers:
            try:
                for t in supplier().translations() or []:
                    if isinstance(t, Translations):
                        add(t)
            except Exception as e:  # noqa: BLE001 - a failing supplier contributes nothing
                log.warning("Translations: %s failed (%s)", getattr(supplier, "__name__", supplier), e)
        for t in self.authored():
            add(t)
        if merged:
            log.info(
                "Translations: %d locale(s) %s (fallback '%s')",
                len(merged),
                sorted(merged),
                fallback_locale(),
            )
        return merged

    def authored(self) -> list[Translations]:
        found: list[Translations] = []
        if not self._dir.is_dir():
            return found
        for file in sorted(self._dir.rglob("*")):
            if file.suffix not in (".yaml", ".yml"):
                continue
            try:
                root = yaml.safe_load(file.read_text(encoding="utf-8"))
            except Exception as e:  # noqa: BLE001 - a broken file must not take the app down
                log.warning("Failed to read translations %s: %s", file, e)
                continue
            t = parse(root, file.relative_to(self._dir).as_posix())
            if t is not None:
                found.append(t)
        return found

    def message(self, key: str, locale: str | None) -> str | None:
        all_ = self.catalogue()
        for candidate in candidates(locale):
            messages = all_.get(candidate)
            if messages is not None and key in messages:
                return messages[key]
        return None

    def interpolate(self, text: str | None, locale: str | None) -> str | None:
        """``${i18n.key}`` expressions in ``text`` resolved for ``locale``."""
        if text is None or "i18n." not in text:
            return text

        def replace(m: re.Match) -> str:
            key = m.group(1)
            resolved = self.message(key, locale)
            if resolved is None:
                marker = f"{normalize(locale)}#{key}"
                if marker not in self._warned:
                    self._warned.add(marker)
                    log.warning("Missing translation '%s' for locale '%s' — showing the key", key, locale)
                return key
            return resolved

        return EXPRESSION.sub(replace, text)

    def translate_tree(self, node: Any, locale: str | None) -> Any:
        """``node`` (mutated in place) with every ``${i18n.…}`` resolved for ``locale``."""
        if isinstance(node, dict):
            for k, v in list(node.items()):
                node[k] = self.interpolate(v, locale) if isinstance(v, str) else self.translate_tree(v, locale)
        elif isinstance(node, list):
            for i, v in enumerate(node):
                node[i] = self.interpolate(v, locale) if isinstance(v, str) else self.translate_tree(v, locale)
        return node

    def reset(self) -> None:
        self._catalogue = None
        self._warned.clear()


def mentions_i18n(node: Any) -> bool:
    if isinstance(node, str):
        return EXPRESSION.search(node) is not None
    if isinstance(node, dict):
        return any(mentions_i18n(v) for v in node.values())
    if isinstance(node, list):
        return any(mentions_i18n(v) for v in node)
    return False


__all__ = [
    "TranslationRegistry",
    "EXPRESSION",
    "candidates",
    "fallback_locale",
    "locale_of",
    "mentions_i18n",
    "parse",
]
