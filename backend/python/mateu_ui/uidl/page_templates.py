"""Page templates a :class:`~mateu_ui.uidl.components.Form` can FILL (``Form(template=…)``, YAML
``template:`` on a ``type: Form``) — the Python mirror of Java's ``io.mateu.uidl.fluent.FormTemplate``
records (``ItemOverviewPage``, ``WelcomePage``…; the class name IS the YAML ``type``).

A template's fields and slots are the TEMPLATE's (named as Spectra names them). The server lays the
slots out as ordinary components, each in a container whose id names the slot, so every renderer
draws the page; the template's own values travel on the Form metadata (``template: {type, avatar,
photo}``) for a renderer that has the template itself (Redwood paints Spectra's). The layout is
``mateu_ui.core.page_templates`` (Java's ``PageTemplates``).
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .components import Component
from .patterns import DockedPanel


class FormTemplate:
    """Marker base of every page template (Java's ``FormTemplate``). NOT a component: a template
    is something a Form fills, never placed on a page by itself."""


@dataclass(frozen=True)
class TemplateImage:
    """The image of a template: a ``src`` url, or the ``initials`` an avatar shows without one.
    ``alt`` is what a screen reader reads for it; without one, the page's title (the image is the
    record the page is about)."""

    src: str | None = None
    initials: str | None = None
    alt: str | None = None


@dataclass(frozen=True)
class ItemOverviewPage(FormTemplate):
    """Redwood's Item overview page: the overview panel (``avatar`` | ``photo``, slots ``body`` and
    ``footer``) beside the main slot (the form's content). The form's title/subtitle/first badge/
    peer navigation/toolbar are the item's."""

    avatar: TemplateImage | None = None
    photo: TemplateImage | None = None
    body: tuple[Component, ...] = ()
    footer: tuple[Component, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "body", tuple(self.body or ()))
        object.__setattr__(self, "footer", tuple(self.footer or ()))


@dataclass(frozen=True)
class WelcomePage(FormTemplate):
    """Redwood's Welcome page: OWNS the header — the form's title/subtitle/overline/toolbar become a
    centred banner over the content (the tiles). ``background_color`` = Spectra's ``dark-<tone>`` or
    the bare hero tone."""

    background_color: str | None = None


@dataclass(frozen=True)
class MultimediaContentPage(FormTemplate):
    """A multimedia content page: a welcome-style banner (owns the header) over the sections."""

    background_color: str | None = None


@dataclass(frozen=True)
class HeroSearchPage(FormTemplate):
    """Redwood's Hero search page: a welcome-style banner (owns the header) over the results."""

    background_color: str | None = None


@dataclass(frozen=True)
class DashboardLandingPage(FormTemplate):
    """Redwood's Dashboard landing page: the ``kpi`` slot's metrics as one scoreboard band over the
    panels (the form's content) on the dashboard grid."""

    kpi: tuple[Component, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "kpi", tuple(self.kpi or ()))


@dataclass(frozen=True)
class GeneralOverviewPage(FormTemplate):
    """Redwood's General overview page: the main slot (the content) beside the ``info`` panel."""

    info: tuple[Component, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "info", tuple(self.info or ()))


@dataclass(frozen=True)
class CollectionDetailPage(FormTemplate):
    """Redwood's Collection detail page: the collection (``list``) beside the selected item's detail
    (the content) — or, when the page has no content, the ``no_selection`` slot."""

    list: tuple[Component, ...] = ()
    no_selection: tuple[Component, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "list", tuple(self.list or ()))
        object.__setattr__(self, "no_selection", tuple(self.no_selection or ()))


@dataclass(frozen=True)
class FoldoutPage(FormTemplate):
    """Redwood's Foldout page: one foldout layout — the ``overview`` slot as its overview, the form's
    ``FoldoutPanel``\\ s as its panels (any other content component becomes an untitled panel)."""

    overview: tuple[Component, ...] = ()
    orientation: str | None = None

    def __post_init__(self):
        object.__setattr__(self, "overview", tuple(self.overview or ()))


@dataclass(frozen=True)
class AdvancedCreateEditPage(FormTemplate):
    """Redwood's Advanced create and edit page: the main slot (the content) and, with a ``detail``,
    the detail beside it (an ``@aside``-like named-slot grid)."""

    detail: tuple[Component, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "detail", tuple(self.detail or ()))


@dataclass(frozen=True)
class GuidedProcessStep:
    """One step of a :class:`GuidedProcessPage`."""

    id: str | None = None
    title: str | None = None
    description: str | None = None
    content: tuple[Component, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "content", tuple(self.content or ()))


@dataclass(frozen=True)
class GuidedProcessPage(FormTemplate):
    """Redwood's Guided process page: the steps of ONE form (one tab per step, the first active)."""

    steps: tuple[GuidedProcessStep, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "steps", tuple(self.steps or ()))


@dataclass(frozen=True)
class DataManagementPage(FormTemplate):
    """Redwood's Data management page: OWNS the header — the title, the toolbar (the form's
    buttons), the data view (the content, an open ``end`` panel beside it) and an open ``bottom``
    panel under it. The panels are the :class:`~mateu_ui.uidl.patterns.DockedPanel` the
    ``DataManagement`` archetype docks."""

    end: DockedPanel | None = None
    bottom: DockedPanel | None = None


@dataclass(frozen=True)
class MessagePage(FormTemplate):
    """A message page: ONE card, centred near the top of a full-bleed illustrated background, with no
    app chrome — a confirmation, a "check your email", an error, a signed-out or a simple entry page.
    Spectra has no such component; it is composed. The card is filled from the form: its title is the
    card's heading, its subtitle and overline the lines around it, its content the card's body and its
    toolbar the card's actions; the ``footer`` slot is the row of small links at the card's foot. OWNS
    the header. ``background`` = a tone of the welcome palette (Spectra's ``dark-<tone>`` accepted;
    ``auto`` or none keeps the default), ``image`` = an own illustration (a URL), ``width`` = the
    card's width (a CSS length, 460px when absent)."""

    background: str | None = None
    image: str | None = None
    width: str | None = None
    footer: tuple[Component, ...] = ()

    def __post_init__(self):
        object.__setattr__(self, "footer", tuple(self.footer or ()))

    def image_or_null(self) -> str | None:
        """The own image's URL when it is safe inside a CSS ``url("…")`` (no quote, parenthesis or
        backslash could end it), else None (Java's ``MessagePage.imageOrNull``)."""
        if self.image is None or not str(self.image).strip():
            return None
        trimmed = str(self.image).strip()
        return trimmed if re.fullmatch(r"[\w\s/.:%~?&=#+,@-]+", trimmed, re.ASCII) else None

    def width_or_null(self) -> str | None:
        """The card's width when it is a plain CSS length (``32rem``, ``520px``…), else None."""
        if self.width is None or not str(self.width).strip():
            return None
        trimmed = str(self.width).strip()
        return trimmed if re.fullmatch(r"\d+(\.\d+)?(px|rem|em|ch|vw|%)", trimmed, re.ASCII) else None


#: Every template by its YAML ``type`` (= the Java record's simple name).
TEMPLATES: dict[str, type] = {
    cls.__name__: cls
    for cls in (
        ItemOverviewPage,
        WelcomePage,
        DashboardLandingPage,
        GeneralOverviewPage,
        CollectionDetailPage,
        FoldoutPage,
        MultimediaContentPage,
        AdvancedCreateEditPage,
        GuidedProcessPage,
        DataManagementPage,
        HeroSearchPage,
        MessagePage,
    )
}
