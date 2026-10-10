"""Declarative archetypes composed from field conventions: Dashboard, Foldout, ItemOverview, Welcome, CollectionDetail, GeneralOverview."""

from __future__ import annotations

from .views import ComponentTreeSupplier


class Dashboard(ComponentTreeSupplier):
    """Declarative dashboard landing page. Declare type-hinted fields holding fluent components:

    - consecutive ``MetricCard`` fields group into a full-width ``Scoreboard`` KPI band;
    - component fields annotated ``Panel(title, subtitle, col_span, row_span)`` become titled
      tiles on a responsive grid;
    - any other component field lands on the grid as-is.

    Override :meth:`columns` to fix the column count (0 = auto-fit)."""

    def style(self) -> str | None:
        return None

    def columns(self) -> int:
        return 0

    def reorderable(self) -> bool:
        """Whether the viewer may drag the tiles into their own order. The order is kept per viewer
        by the renderer; the field order stays the default. Default: False."""
        return False


class Foldout(ComponentTreeSupplier):
    """Declarative Redwood-style foldout page: the first component field without ``Panel`` is the
    always-visible overview; ``Panel(title, subtitle, icon, open)`` fields are lateral fold-out
    panels."""

    def style(self) -> str | None:
        return None

    def header_title(self) -> str | None:
        """Big heading of the header band above the columns (RDS "overview title"). Defaults to
        the class ``@title``; override to compute it. Return ``None`` to hide the header band."""
        return getattr(type(self), "__mateu_title__", None)

    def header_badges(self) -> list[str]:
        """Label/Value chips shown under the header title. Empty by default."""
        return []

    def orientation(self) -> str:
        """Overview orientation: ``"vertical"`` (overview on the left, default) or ``"horizontal"``
        (overview across the top, panels in a row below)."""
        return "vertical"

    def navigation_header(self):
        """Navigation Header (prev/next + go-to-parent). Return a
        :class:`mateu_uidl.components.FoldoutNavigation`, or ``None`` (default) to hide the bar. Each
        non-blank ``*_action_id`` names a method Mateu runs when the control is clicked."""
        return None

    def overview_edit_action_id(self) -> str | None:
        """ActionId run by the overview's Edit affordance (RDS edit flow). ``None`` (default) hides
        the Edit button; the method typically returns a Dialog (vertical) or navigates (horizontal)."""
        return None


class ItemOverview(ComponentTreeSupplier):
    """Item overview page: the first component field without ``Panel`` is the key-info panel
    (left, sticky); ``Panel(title)`` fields become tabs on the right. Override
    :meth:`panel_width` to change the key-info panel width."""

    def style(self) -> str | None:
        return None

    def panel_width(self) -> str:
        return "22rem"


class Welcome(ComponentTreeSupplier):
    """Welcome page: ``Button`` fields become call-to-action buttons inside a centered hero;
    ``Panel(title)`` component fields become highlight tiles on a grid below. Override
    :meth:`hero_title` / :meth:`hero_subtitle` / :meth:`hero_image` for the hero chrome."""

    def style(self) -> str | None:
        return None

    def hero_title(self) -> str | None:
        return None

    def hero_subtitle(self) -> str | None:
        return None

    def hero_image(self) -> str | None:
        return None


class CollectionDetail(ComponentTreeSupplier):
    """Collection-detail page (the Redwood "Collection Detail" template, the Python analogue of
    Java's CollectionDetail archetype): a searchable list of items on the left — clickable cards
    with title, caption and badges — and the selected item's detail on the right, re-rendered in
    place on every selection. Implement :meth:`rows`, :meth:`id_of`, :meth:`title_of` and
    :meth:`detail`."""

    search: str | None = None
    selected_id: str | None = None

    __mateu_refresh_action__ = "filterCollection"
    __mateu_refresh_debounce__ = 400

    def rows(self, search):
        raise NotImplementedError

    def id_of(self, row):
        raise NotImplementedError

    def title_of(self, row):
        raise NotImplementedError

    def detail(self, row):
        raise NotImplementedError

    def caption_of(self, row):
        return None

    def badges_of(self, row):
        return ()

    def list_label(self, count: int) -> str:
        return f"{count} items"

    def list_width(self) -> str:
        return "24rem"

    def empty_detail(self):
        from mateu_uidl import components as fluent

        return fluent.EmptyState(
            icon="👈",
            title="Select an item",
            description="Pick an item from the list to see its detail.",
            style="flex: 1; margin-top: 3rem;",
        )

    def component(self):
        from mateu_uidl import components as fluent

        items = []
        selected = None
        for row in self.rows(self.search):
            row_id = self.id_of(row)
            is_selected = row_id is not None and row_id == self.selected_id
            if is_selected:
                selected = row
            items.append(
                fluent.QueueItem(
                    id=row_id,
                    title=self.title_of(row),
                    caption=self.caption_of(row),
                    badges=tuple(self.badges_of(row)),
                    selected=is_selected,
                )
            )
        width = self.list_width()
        queue = fluent.TaskQueue(
            action_id="selectCollectionItem",
            groups=(fluent.QueueGroup(label=self.list_label(len(items)), items=tuple(items)),),
        )
        detail = self.detail(selected) if selected is not None else self.empty_detail()
        # The screen IS a template + slots (coherence-plan #7) on the one responsive grid (#9): a
        # "list detail" template whose fixed-width list column and free-space detail column are the
        # #8 sizing vocabulary, stacking to one column on a narrow container. Layout (the areas)
        # separated from content (the slots).
        return fluent.VerticalLayout(
            spacing=True,
            content=(
                fluent.FormField(field_id="search", label="Search"),
                fluent.ResponsiveGrid(
                    id="collection-detail",
                    columns=(fluent.GridTrack.fixed(width), fluent.GridTrack.fill()),
                    stack_below="48rem",
                    grid_template_areas='"list detail"',
                    content=(
                        fluent.Slotted(slot="list", content=queue),
                        fluent.Slotted(slot="detail", content=detail),
                    ),
                ),
            ),
        )


class GeneralOverview(ComponentTreeSupplier):
    """Record overview page (the Redwood "General Overview" template, the Python analogue of
    Java's GeneralOverview archetype): a record context switcher at the top jumps between records
    without leaving the page; the selected record renders below — typically an ``EntityHeader``
    over property cards. Implement :meth:`switcher_options`, :meth:`load` and :meth:`overview`."""

    record: str | None = None

    __mateu_refresh_action__ = "switchRecord"
    __mateu_refresh_debounce__ = 0

    def switcher_options(self):
        """``(value, label)`` pairs — value = record id, label = what the user reads."""
        raise NotImplementedError

    def load(self, record_id: str):
        raise NotImplementedError

    def overview(self, row):
        raise NotImplementedError

    def empty_overview(self):
        from mateu_uidl import components as fluent

        return fluent.EmptyState(
            icon="🗂", title="Select a record", description="Pick a record in the switcher above."
        )

    def component(self):
        from mateu_uidl import components as fluent

        options = list(self.switcher_options())
        if not self.record and options:
            self.record = str(options[0][0])
        row = self.load(self.record) if self.record else None
        return fluent.VerticalLayout(
            spacing=True,
            content=(
                fluent.FormField(field_id="record", label="", options=tuple(options)),
                self.overview(row) if row is not None else self.empty_overview(),
            ),
        )
