"""The Redwood pattern-gap vocabulary: the tri-state ``Toggle`` and the archetypes' display
records, drafts (``Draftable``), the header record switcher, hero tones and docked panels.

The Python analogue of Java's ``Toggle`` / ``WizardDisplay`` / ``CrudDisplay`` /
``GeneralOverviewDisplay`` / ``Draftable`` / ``RecordSwitcher`` + ``RecordSwitcherSupplier`` /
``HeroTone`` / ``DockedPanel``. Same names and semantics, the port's idioms: supplier hooks are
parameterless, display records are frozen dataclasses (``dataclasses.replace`` is the
``toBuilder``), wizard steps are identified by their 1-based ``Step(n)`` number.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any


class Toggle(str, Enum):
    """The tri-state switch of an affordance an archetype brings built in (the Redwood
    ``displayOptions`` grammar): ``on`` — shown and usable; ``off`` — not shown; ``disabled`` —
    shown but inert. Consumed server-side while composing: a disabled affordance travels as a
    disabled button, an off one does not travel at all (and the server refuses it either way)."""

    on = "on"
    off = "off"
    disabled = "disabled"

    def shown(self) -> bool:
        """Whether the affordance is drawn at all (``on`` or ``disabled``)."""
        return self is not Toggle.off

    def enabled(self) -> bool:
        """Whether the affordance can be used (``on`` only)."""
        return self is Toggle.on

    @staticmethod
    def or_(toggle: "Toggle | str | None", fallback: "Toggle") -> "Toggle":
        """``None`` reads as ``fallback`` (a display record may leave toggles unset)."""
        if toggle is None:
            return fallback
        return toggle if isinstance(toggle, Toggle) else Toggle(toggle)


@dataclass(frozen=True)
class WizardDisplay:
    """The built-in affordances of a ``Wizard``: ``save_draft`` ("Save") and ``save_and_close``
    (both only on a :class:`Draftable` wizard) and ``skip`` (on the steps ``step_skippable``
    allows). ``None`` (or a plain string) is normalised to the Toggle; unset toggles read as
    ``on``. Override ``Wizard.display()``."""

    save_draft: Toggle = Toggle.on
    save_and_close: Toggle = Toggle.on
    skip: Toggle = Toggle.on

    @staticmethod
    def defaults() -> "WizardDisplay":
        return WizardDisplay()

    def __post_init__(self):
        # None reads as the default; a plain string is coerced to its Toggle
        object.__setattr__(self, "save_draft", Toggle.or_(self.save_draft, Toggle.on))
        object.__setattr__(self, "save_and_close", Toggle.or_(self.save_and_close, Toggle.on))
        object.__setattr__(self, "skip", Toggle.or_(self.skip, Toggle.on))


@dataclass(frozen=True)
class CrudDisplay:
    """The built-in affordances of a ``Crud``, on top of the capability gates: ``create`` (the New
    button), ``delete`` (the Delete button), ``save_and_next`` (the edit drawer's "Save and next",
    default OFF) and ``error_banner`` (a failed drawer save shows its message inside the drawer,
    default on). Override ``Crud.display()``."""

    create: Toggle = Toggle.on
    delete: Toggle = Toggle.on
    save_and_next: Toggle = Toggle.off
    error_banner: Toggle = Toggle.on

    @staticmethod
    def defaults() -> "CrudDisplay":
        return CrudDisplay()

    def __post_init__(self):
        # None reads as the default; a plain string is coerced to its Toggle
        object.__setattr__(self, "create", Toggle.or_(self.create, Toggle.on))
        object.__setattr__(self, "delete", Toggle.or_(self.delete, Toggle.on))
        object.__setattr__(self, "save_and_next", Toggle.or_(self.save_and_next, Toggle.off))
        object.__setattr__(self, "error_banner", Toggle.or_(self.error_banner, Toggle.on))


@dataclass(frozen=True)
class GeneralOverviewDisplay:
    """The built-in affordances of a ``GeneralOverview``: ``info`` (the contextual info panel,
    default on) and ``promote_info_slot`` (on narrow pages the info panel stacks ABOVE the main
    content, default off)."""

    info: Toggle = Toggle.on
    promote_info_slot: Toggle = Toggle.off

    @staticmethod
    def defaults() -> "GeneralOverviewDisplay":
        return GeneralOverviewDisplay()

    def __post_init__(self):
        # None reads as the default; a plain string is coerced to its Toggle
        object.__setattr__(self, "info", Toggle.or_(self.info, Toggle.on))
        object.__setattr__(self, "promote_info_slot", Toggle.or_(self.promote_info_slot, Toggle.off))


class Draftable:
    """A wizard that can be saved half-way and resumed later (the Redwood guided-process
    saveDraft / saveAndClose / resumeStepId trio). Adds "Save" and "Save and close" to every
    step (switchable through :class:`WizardDisplay`).

    - :meth:`save_draft` persists what has been captured so far — the state is bound but NEVER
      validated. Its return value is the response (None → a "Draft saved" toast).
    - :meth:`close_draft` is where "Save and close" lands after saving (a route string or a
      ``UICommand``; None → ``"/"``).
    - :meth:`resume_step` names the step NUMBER (1-based) a freshly opened wizard resumes on, or
      None to start at the beginning."""

    def save_draft(self) -> Any:
        raise NotImplementedError

    def close_draft(self) -> Any:
        return None

    def resume_step(self) -> int | None:
        return None


class HeroTone(str, Enum):
    """The tone of a hero band: ``auto`` keeps the renderer's default hero; the others paint a
    DARK tinted band with light ink (hues, not brand colors — each renderer maps them)."""

    auto = "auto"
    ocean = "ocean"
    pine = "pine"
    lilac = "lilac"
    teal = "teal"
    rose = "rose"
    pebble = "pebble"
    slate = "slate"
    plum = "plum"
    sienna = "sienna"


def hero_tone_wire(tone: "HeroTone | str | None") -> str | None:
    """The wire value of a hero tone: ``None``/``auto`` → None (the default look)."""
    if tone is None:
        return None
    value = tone.value if isinstance(tone, HeroTone) else str(tone)
    return None if not value or value == HeroTone.auto.value else value


class SwitcherType(str, Enum):
    """What a :class:`RecordSwitcher` switches: the ``object`` shown, or the ``context`` the page
    is evaluated in."""

    object = "object"
    context = "context"


@dataclass(frozen=True)
class RecordSwitcher:
    """A record/context switcher in the page header (the Redwood selectObject/selectContext
    element). ``options`` are ``(value, label)`` pairs (or ``Option`` objects / dicts with
    ``value``/``label``); ``value`` is the selected one; ``label`` an optional hint; ``searchable``
    offers type-to-filter; ``disabled`` shows it read-only."""

    options: tuple = ()
    value: str | None = None
    type: SwitcherType = SwitcherType.object
    label: str | None = None
    searchable: bool = False
    disabled: bool = False

    def __post_init__(self):
        object.__setattr__(self, "options", tuple(self.options or ()))


class RecordSwitcherSupplier:
    """Implemented by a page to put a :class:`RecordSwitcher` in its header — the sibling of
    ``PeerNavigationSupplier``. :meth:`switcher` builds it (None = no switcher); picking an entry
    dispatches :attr:`ACTION_ID` with the picked value in the :attr:`VALUE_PARAMETER` parameter,
    which runs :meth:`switch_to` — return ``self`` (or None) to re-render in place, or anything
    an action may return (a route string navigates)."""

    ACTION_ID = "_switchRecord"
    VALUE_PARAMETER = "_record"

    def switcher(self) -> "RecordSwitcher | None":
        raise NotImplementedError

    def switch_to(self, value: str | None) -> Any:
        raise NotImplementedError


@dataclass(frozen=True)
class DockedPanel:
    """A panel docked beside (end) or under (bottom) a ``DataManagement`` page's content: it
    REFLOWS the content rather than overlaying it. ``size`` is its width (end) or max height
    (bottom) as a CSS length (None = 22rem / 16rem); ``open`` whether it starts open."""

    id: str | None = None
    title: str | None = None
    content: Any = None
    size: str | None = None
    open: bool = False
