"""Fluent component trees and the declarative archetypes composed from field conventions (Java's DashboardComposer / WelcomeComposer / archetype orchestrators)."""

from __future__ import annotations

from mateu_dtos import (
    CardMetadata,
    ClientSideComponent,
    ResponsiveGridMetadata,
    TabLayoutMetadata,
    TabMetadata,
    VerticalLayoutMetadata,
)
from mateu_uidl import (
    components as fluent,
    ComponentTreeSupplier,
    Dashboard,
    Foldout,
    ItemOverview,
    Label,
    Panel,
    Welcome,
)

from .. import page_inference
from ..naming import (
    camel_case,
    humanize,
)
from ..reflection import view_fields
from ._base import MixinBase


class ArchetypeMapperMixin(MixinBase):
    # ── Fluent component trees & declarative archetypes ───────────────────────
    def component_tree(self, instance):
        """The component tree of an archetype / ``ComponentTreeSupplier`` view (a fluent
        component or an already-mapped ``ClientSideComponent``), or ``None`` for form views."""
        if isinstance(instance, Dashboard):
            return self.compose_dashboard(instance)
        if isinstance(instance, Foldout):
            return self.compose_foldout(instance)
        if isinstance(instance, ItemOverview):
            return self.compose_item_overview(instance)
        if isinstance(instance, Welcome):
            return self.compose_welcome(instance)
        if isinstance(instance, ComponentTreeSupplier):
            return instance.component()
        # Page-level inference (@auto_page): a plain class whose structure spells an archetype
        # is composed as it — the Python analogue of Java's InferredDashboard/InferredWelcome.
        if page_inference.composes_dashboard(type(instance)):
            return self.compose_dashboard(instance)
        if page_inference.composes_welcome(type(instance)):
            return self.compose_welcome(instance)
        return None

    def _component_fields(self, instance):
        """``(field, value)`` for every declared field holding a fluent component value."""
        out = []
        for f in view_fields(type(instance)):
            value = getattr(instance, f.name, None)
            if isinstance(value, fluent.Component):
                out.append((f, value))
        return out

    def _panel_title(self, f, panel: Panel) -> str:
        if panel.title:
            return panel.title
        return self.T(f.marker(Label).value if f.has(Label) else humanize(f.name))

    def compose_dashboard(self, instance) -> fluent.ResponsiveGrid:
        items: list[fluent.Component] = []
        pending: list[fluent.MetricCard] = []

        def flush():
            if pending:
                items.append(fluent.Scoreboard(metrics=tuple(pending)))
                pending.clear()

        for f, value in self._component_fields(instance):
            if isinstance(value, fluent.MetricCard):
                pending.append(value)
                continue
            flush()
            panel = f.marker(Panel)
            if panel is not None:
                items.append(
                    fluent.DashboardPanel(
                        id=camel_case(f.name),
                        title=self._panel_title(f, panel),
                        subtitle=panel.subtitle or None,
                        col_span=panel.col_span,
                        row_span=panel.row_span,
                        content=value,
                    )
                )
            else:
                items.append(value)
        flush()
        # A Dashboard subclass configures its columns; an @auto_page plain class keeps auto-fit.
        columns = instance.columns() if isinstance(instance, Dashboard) else 0
        reorderable = instance.reorderable() if isinstance(instance, Dashboard) else False
        # Consolidated onto the one responsive grid (coherence-plan #9): N columns → N fill tracks;
        # 0 → auto-fit. The tiles and the scoreboard band carry their own grid-column span, so the
        # grid needs no per-child spans; align-items:stretch keeps the tiles equal-height.
        tracks = tuple(fluent.GridTrack.fill() for _ in range(columns)) if columns > 0 else ()
        return fluent.ResponsiveGrid(
            columns=tracks,
            content=tuple(items),
            reorderable=reorderable,
            style="align-items: stretch;",
        )

    def compose_foldout(self, instance: Foldout) -> fluent.FoldoutLayout:
        overview: fluent.Component | None = None
        panels: list[fluent.FoldoutPanel] = []
        for f, value in self._component_fields(instance):
            panel = f.marker(Panel)
            if panel is None:
                if overview is None:
                    overview = value
                continue
            panels.append(
                fluent.FoldoutPanel(
                    id=camel_case(f.name),
                    title=self._panel_title(f, panel),
                    subtitle=panel.subtitle or None,
                    icon=panel.icon or None,
                    open=panel.open,
                    content=value,
                )
            )
        return fluent.FoldoutLayout(
            overview=overview,
            panels=tuple(panels),
            header_title=instance.header_title(),
            badges=tuple(instance.header_badges()),
            orientation=instance.orientation(),
            navigation=instance.navigation_header(),
            overview_edit_action_id=instance.overview_edit_action_id(),
        )

    def compose_item_overview(self, instance: ItemOverview) -> ClientSideComponent:
        key_info: fluent.Component | None = None
        tabs: list[tuple[str, fluent.Component]] = []
        for f, value in self._component_fields(instance):
            panel = f.marker(Panel)
            if panel is None:
                if key_info is None:
                    key_info = value
                continue
            tabs.append((self._panel_title(f, panel), value))
        tab_comps = [
            self.client(TabMetadata(label=label, active=i == 0), None, [self.map_component(c)])
            for i, (label, c) in enumerate(tabs)
        ]
        tab_layout = self.client(TabLayoutMetadata(), "item-tabs", tab_comps)
        if key_info is None:
            # Degenerate: no key-info panel → just the tabs (no two-region template to build).
            return tab_layout
        # The screen IS a template + slots (coherence-plan #7) on the one responsive grid (#9): a
        # "keyinfo tabs" template whose fixed-width key-info column is pinned (a sticky slot) beside
        # the free-space tabbed column — replacing the bespoke sticky HorizontalLayout.
        card = self.client(CardMetadata(content=self.map_component(key_info)), "key-info", [])
        card.slot = "keyinfo"
        tab_layout.slot = "tabs"
        return self.client(
            ResponsiveGridMetadata(
                grid_template_columns=f"{instance.panel_width()} 1fr",
                stack_below="48rem",
                grid_template_areas='"keyinfo tabs"',
                sticky_areas=["keyinfo"],
            ),
            None,
            [card, tab_layout],
        )

    def compose_welcome(self, instance) -> ClientSideComponent:
        ctas: list[fluent.Component] = []
        tiles: list[fluent.Component] = []
        for f, value in self._component_fields(instance):
            if isinstance(value, fluent.Button):
                ctas.append(value)
                continue
            panel = f.marker(Panel)
            if panel is not None:
                tiles.append(
                    fluent.DashboardPanel(
                        id=camel_case(f.name),
                        title=self._panel_title(f, panel),
                        subtitle=panel.subtitle or None,
                        col_span=panel.col_span,
                        row_span=panel.row_span,
                        content=value,
                    )
                )
            else:
                tiles.append(value)
        if isinstance(instance, Welcome):
            hero_title = instance.hero_title()
            hero_subtitle = instance.hero_subtitle()
            hero_image = instance.hero_image()
        else:
            # @auto_page plain class: the hero title is the declared @title; subtitle and
            # image have no declarative source — setting them is a reason to subclass Welcome.
            hero_title = getattr(type(instance), "__mateu_title__", None)
            hero_subtitle = hero_image = None
        content = [
            self.map_component(
                fluent.HeroSection(
                    id="hero",
                    title=hero_title,
                    subtitle=hero_subtitle,
                    image=hero_image,
                    centered=True,
                    content=tuple(ctas),
                )
            )
        ]
        if tiles:
            # The highlight tiles land on the one responsive grid (coherence-plan #9), auto-fitting —
            # the same consolidation the Dashboard archetype uses, retiring the bespoke DashboardLayout.
            content.append(
                self.map_component(
                    fluent.ResponsiveGrid(
                        id="highlights", content=tuple(tiles), style="align-items: stretch;"
                    )
                )
            )
        return self.client(VerticalLayoutMetadata(spacing=True), None, content)
