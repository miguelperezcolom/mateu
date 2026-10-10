"""View base classes: HeroSearch, SmartSearchPage, Wizard, Translator, ComponentTreeSupplier, LinkSupplier."""

from __future__ import annotations

from typing import (
    Generic,
    TYPE_CHECKING,
)

from .listing import (
    Crud,
    F,
    Filterable,
    Listing,
    R,
)
from .messages import T
from .placement import Searchable

if TYPE_CHECKING:
    from .messages import Message
    from .placement import NavLink


class HeroSearch(Crud[T]):
    """A search-first page: a centered hero header (title, subtitle, background image) over the
    standard crud listing, results as cards. Starts empty — the user searches. The Python
    analogue of Java's HeroSearch archetype."""

    def hero_title(self) -> str | None:
        return None

    def hero_subtitle(self) -> str | None:
        return None

    def hero_image(self) -> str | None:
        """Background image URL, rendered with a dark overlay."""
        return None


class SmartSearchPage(Listing[R], Filterable[F], Searchable, Generic[F, R]):
    """Smart search page (the Oracle Redwood "Smart Search" template): a standalone, search-first
    page — an optional intro line under the page title, the smart search bar (typed filter facets
    and chips) and the results collection. Read-only and starts EMPTY (the user searches): no
    OnLoad→search preload trigger. A :class:`Listing` that is :class:`Searchable` and
    :class:`Filterable` — the Python analogue of Java's SmartSearchPage archetype."""

    def page_subtitle(self) -> str | None:
        """Optional intro line rendered under the page title, above the smart search bar."""
        return None

    def pre_search_content(self):
        """What the page shows BEFORE the first search (the Redwood smart-filter-search
        ``dashboard`` slot): a dashboard, recent items, tips… — replaced by the results as soon as
        the user searches (wire ``CrudMetadata.pre_search``). None (default) = the usual empty
        listing."""
        return None


class Wizard:
    """A multi-step form; fields carry ``Step(n)`` and ``complete()`` runs on the last step.

    Steps are identified by their 1-based ``Step(n)`` number in every hook. Implement
    :class:`mateu_uidl.Draftable` for "Save" / "Save and close" + resume."""

    def complete(self) -> Message:
        raise NotImplementedError

    def display(self):
        """This wizard's built-in affordances (the Redwood guided-process ``displayOptions``): the
        draft buttons of a ``Draftable`` wizard and the "Skip" button of skippable steps — each
        ``on``, ``off`` or ``disabled`` (see :class:`mateu_uidl.WizardDisplay`)."""
        from .patterns import WizardDisplay

        return WizardDisplay.defaults()

    def step_skippable(self, step: int) -> bool:
        """Whether the user may SKIP step ``step`` (1-based; the Redwood ``spSkip``): a "Skip"
        button moves on without requiring the step. Default: no step is skippable."""
        return False

    def before_step_navigate(self, from_step: int, to_step: int):
        """Cancelable hook run BEFORE the wizard moves between steps (1-based numbers): Next,
        Back, Skip, a jump to a visited step and the completion action (whose ``to_step`` is the
        result step) all pass through it, with the state already bound. Return None to let the
        move happen; anything else cancels it and becomes the response (typically an error
        ``Message``). Default: never cancels."""
        return None

    def on_next(self, from_step: int, to_step: int) -> None:
        """Runs when the user moves FORWARD from ``from_step`` to ``to_step`` (both 1-based),
        after the state has been bound and before the target step renders — the hook archetypes
        like the import wizard use to compute a step's content from the previous steps' answers.
        Default: no-op."""


class Translator:
    """Implement and register to translate titles, labels and menu entries."""

    def translate(self, key: str) -> str:
        raise NotImplementedError

    def locale(self) -> str | None:
        """The UI language as a BCP 47 tag (``"es"``, ``"en-GB"``), or None to let the browser
        decide. Travels as ``AppMetadata.locale``: the web client sets ``<html lang>`` from it and
        draws its own chrome (buttons, empty states…) in that language."""
        return None


class ComponentTreeSupplier:
    """A view that supplies its UI as a fluent component tree (see ``mateu_uidl.components``)
    instead of reflected form fields. The Python analogue of Java's ``ComponentTreeSupplier``."""

    def component(self):
        raise NotImplementedError

    def style(self) -> str | None:
        """The container style of the tree envelope. Java's ``ComponentTreeSupplier`` defaults
        to ``"max-width:900px;margin: auto;"``; a view returns ``None`` for no envelope styling."""
        return "max-width:900px;margin: auto;"


class LinkSupplier:
    """Implemented by a view to attach a navigation link icon to fields at runtime (an
    alternative to the static :class:`LinkTo` marker, over which this takes precedence).
    :meth:`link` returns the :class:`NavLink` for the field named ``member_name``, or ``None``
    for no link — a ``LinkTo`` on the field then applies if present. The Python analogue of
    Java's ``LinkSupplier``."""

    def link(self, member_name: str) -> NavLink | None:
        raise NotImplementedError
