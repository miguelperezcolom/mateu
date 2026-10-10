"""Form layout: sections, tabs, zones, folding and form rows (Java's SectionFormRenderer / FormLayoutBuilder / LayoutInference)."""

from __future__ import annotations

from datetime import (
    date,
    datetime,
)
from decimal import Decimal
from enum import Enum

from mateu_dtos import CustomFieldMetadata, ServerSideComponent
from mateu_dtos import (
    AccordionLayoutMetadata,
    AccordionPanelMetadata,
    ButtonMetadata,
    CardMetadata,
    ClientSideComponent,
    ContentLayoutMetadata,
    DivMetadata,
    FormFieldMetadata,
    FormLayoutMetadata,
    FormRowMetadata,
    HorizontalLayoutMetadata,
    ResponsiveGridMetadata,
    SeparatorMetadata,
    TabLayoutMetadata,
    TabMetadata,
    TextMetadata,
    VerticalLayoutMetadata,
)
from mateu_uidl import (
    Aside,
    Multiline,
    PlainText,
    Required,
    Section,
    SeparatorBefore,
    Tab,
)

from .. import (
    labels_aside_inference,
    layout_inference,
)
from ..naming import camel_case
from ..reflection import (
    class_flag,
    view_fields,
)
from ..islands import EMBEDDED_MARKER
from ._base import MixinBase
from ._common import _row_cell


def _has_affordances(section: "Section | None") -> bool:
    return section is not None and bool(
        section.add_action or section.edit_action or section.view_more_action
    )


def section_affordance_ids(cls) -> list[str]:
    """The action ids every ``Section(add_action=, edit_action=, view_more_action=)`` of a view
    dispatches (camelCase of the method names), in declaration order, deduplicated."""
    out: list[str] = []
    try:
        fields = view_fields(cls)
    except Exception:  # noqa: BLE001 - a view whose hints do not resolve has no affordances
        return out
    for f in fields:
        sec = f.marker(Section)
        if sec is None:
            continue
        for name in (sec.add_action, sec.edit_action, sec.view_more_action):
            if name and camel_case(name) not in out:
                out.append(camel_case(name))
    return out


class LayoutMapperMixin(MixinBase):
    # ── Fields & layout ────────────────────────────────────────────────────────
    def wrap_aside(self, cls, instance, content: list) -> list:
        """If the view declares any ``Aside()`` component-holder field, pull those into the aside
        slot of a ContentLayout wrapping the form (main slot) — the Python analogue of Java's
        PageContentBuilder.wrap_aside_if_present. Regions travel as slotted children main-N/aside-N;
        a form with no ``Aside()`` field is returned untouched (the common case, zero overhead)."""
        aside_fields = [f for f in view_fields(cls) if f.has(Aside)]
        if not aside_fields:
            return content
        aside_children = []
        for f in aside_fields:
            value = getattr(instance, f.name, None)
            if callable(value):
                value = value()
            if value is not None:
                aside_children.append(self.map_component(value))
        if not aside_children:
            return content
        marker = aside_fields[0].marker(Aside)
        children = []
        for i, c in enumerate(content):
            c.slot = f"main-{i}"
            children.append(c)
        for i, c in enumerate(aside_children):
            c.slot = f"aside-{i}"
            children.append(c)
        meta = ContentLayoutMetadata(
            asidePosition=marker.position or "end",
            asideWidth=marker.width,
            asideSticky=marker.sticky,
        )
        return [self.client(meta, "content", children)]

    def form_initial_data(self, cls, instance) -> dict:
        """The field values of a form view as one ``{fieldId: value}`` map (Java parity: the values
        ride here and in the fragment state, NOT as a per-field initialValue). Native JSON types are
        kept (int/bool as-is, Decimal → float, dates ISO, enums by name); a grid field yields a list
        of row maps. Every declared data field is seeded, including those hoisted out of the body
        (KPI/Timestamp)."""
        initial_data: dict = {}
        for f in view_fields(cls):
            # A security-hidden field (EyesOnly unauthorized / Audience mismatch) must not reach the
            # wire at all — not even in state. Header-hoisted fields (KPI/Timestamp) still do.
            if not self._permitted(f):
                continue
            row_type = self.grid_row_type(f)
            if row_type is not None:
                initial_data[camel_case(f.name)] = [
                    {
                        camel_case(c.name): _row_cell(getattr(item, c.name, None))
                        for c in view_fields(row_type)
                    }
                    for item in (getattr(instance, f.name, None) or [])
                ]
                continue
            value = getattr(instance, f.name, None)
            if value is None or isinstance(value, (str, int, float, bool, Decimal, date, datetime, Enum)):
                cell = _row_cell(value)
                if isinstance(cell, Decimal):
                    cell = float(cell)
                initial_data[camel_case(f.name)] = cell
            elif isinstance(value, (list, tuple, set, frozenset)) and all(
                isinstance(v, (str, int, float, bool, Decimal, date, datetime, Enum)) for v in value
            ):
                # a collection of plain values (tags, a bulleted list, a multi-select) rides as a
                # JSON array, like Java's state serialisation of a List<String>
                cells = [_row_cell(v) for v in value]
                initial_data[camel_case(f.name)] = [
                    float(c) if isinstance(c, Decimal) else c for c in cells
                ]
        return initial_data

    def form_cards(self, cls, instance, read_only: bool = False, column_width: str | None = None) -> list:
        read_only = read_only or bool(class_flag(cls, "__mateu_read_only__", False))
        fields = [f for f in view_fields(cls) if self.visible(f)]
        if any(f.has(Tab) for f in fields):
            # A tabbed form is wrapped in the same outlined section Card as a plain section (the
            # TabLayout nests under Div → VerticalLayout → TabLayout).
            return [self._section_card_wrapper(self.tab_layout(cls, fields, instance, read_only))]

        # Group the declared fields into sections (title None = synthetic/unnamed section).
        sections: list[tuple[str | None, list]] = []
        section_zones: list[str] = []
        section_markers: list[Section | None] = []
        current: str | None = None
        current_zone = ""
        current_marker: Section | None = None
        for f in fields:
            # A new section starts when the Section declaration actually changes — comparing
            # EVERY attribute (frozen dataclass equality), not just the caption: two consecutive
            # untitled sections pointing at different zones (or with different property_list/
            # frameless flags) are distinct sections.
            sec = f.marker(Section)
            starts_new = not sections or (
                sec is not None and (current_marker is None or sec != current_marker)
            )
            if sec is not None:
                current = sec.caption
                current_zone = sec.zone
                current_marker = sec
            if starts_new:
                sections.append((current, []))
                section_zones.append(current_zone)
                section_markers.append(current_marker)
            sections[-1][1].append(f)

        # @form_layout on the class: the form's column count and where the field labels sit
        # (an explicit labels_aside=ASIDE|TOP wins; AUTO infers it from the form's shape).
        max_columns = class_flag(cls, "__mateu_form_layout_columns__", 2)
        aside = labels_aside_inference.labels_aside(fields, max_columns, cls)

        # @zones columns on the class: sections lay out side by side (zones win over inference).
        declared_zones = getattr(cls, "__mateu_zones__", None)
        if declared_zones and len(sections) > 1:
            return [self.build_zones(
                declared_zones, sections, section_zones, section_markers, instance, read_only)]

        # @folded_layout: the section cards side by side in one horizontal row (zones win).
        if class_flag(cls, "__mateu_folded_layout__", False) and len(sections) > 1:
            return [ClientSideComponent(
                metadata=HorizontalLayoutMetadata(spacing=True),
                children=[
                    self.section_card(
                        t, self.map_fields(fs, instance, read_only),
                        labels_aside=aside, max_columns=max_columns, titled=True,
                    )
                    for t, fs in sections
                ],
            )]

        if self.prefer_tabs(cls, sections, read_only):
            return [self.tabs_from_sections(sections, instance, read_only)]

        plan = self.fold_plan(cls, sections, read_only)
        if plan is not None:
            return [self.folded_card(plan[0], plan[1], instance, read_only)]

        # Several stacked sections carry their titles (each an <h3> inside its Card) and sit in a
        # full-width VerticalLayout; a single section is untitled (Java parity).
        titled = len(sections) > 1
        cards = [
            self.section_card(
                t, self.map_fields(fs, instance, read_only), section_markers[i],
                labels_aside=aside, max_columns=max_columns, titled=titled,
                column_width=column_width,
            )
            for i, (t, fs) in enumerate(sections)
        ]
        if titled:
            return [ClientSideComponent(
                metadata=VerticalLayoutMetadata(spacing=True),
                children=cards,
                style="width: 100%;",
            )]
        return cards

    def tab_layout(self, cls, fields, instance, read_only: bool) -> ClientSideComponent:
        tabs: list[tuple[str, bool, list]] = []
        current = "Tab"
        for f in fields:
            tb = f.marker(Tab)
            if tb is not None:
                current = tb.name
            if not tabs or tabs[-1][0] != current:
                # The field that opens a group carries its Tab.open flag (mirrors the Java
                # pair.first().open() rule); fields before any Tab fall into the default group.
                tabs.append((current, tb.open if tb is not None else False, []))
            tabs[-1][2].append(self.map_field(f, instance, read_only))
        # A tab is marked active ONLY when it declares @Tab(open=True); the renderer defaults to
        # the first tab otherwise, so Java does not emit active on the default-selected tab.
        comps = []
        for i, (nm, is_open, fs) in enumerate(tabs):
            form_layout = self.client(FormLayoutMetadata(), None, self.form_rows(fs))
            comps.append(
                self.client(
                    TabMetadata(label=self.T(nm), active=bool(is_open)), None, [form_layout]
                )
            )
        # Developer-declared tabs always carry the group semantics; they are adaptable (renderers
        # may degrade them, e.g. to an accordion) only when the class opted into auto-layout.
        return ClientSideComponent(
            metadata=TabLayoutMetadata(
                group_relationship="alternative",
                adaptable=layout_inference.enabled(cls),
            ),
            children=comps,
            style="width: 100%;",
        )

    # ── Layout inference (the @auto_layout decision table, see layout_inference) ─
    def field_weight(self, cls, f) -> int:
        """Estimated visual weight of a declared field, from its effective stereotype."""
        plain = f.has(PlainText) or bool(class_flag(cls, "__mateu_plain_text__", False))
        return layout_inference.estimated_weight(
            self.stereotype_of(f, plain, f.has(Multiline), cls)
        )

    def fold_plan(self, cls, sections, read_only: bool):
        """Fold-optionals rule (Java ``LayoutInference.foldPlan``): on an editable form where the
        developer declared no grouping at all (one unnamed section, no tabs) and the estimated
        weight exceeds one screen, keep the required fields visible and fold the optional ones
        into a collapsed "More options" panel. ``None`` when the rule does not apply."""
        if not layout_inference.enabled(cls) or read_only:
            return None
        # Only when the developer declared no grouping: a single synthetic (unnamed) section.
        # (Java also skips forms with @Tab/@Inline/@Composition/component fields — tabs are
        # handled before this path and the Python backend has no other embedded form fields.)
        if len(sections) != 1 or sections[0][0]:
            return None
        fields = sections[0][1]
        total = sum(self.field_weight(cls, f) for f in fields)
        if total <= layout_inference.FOLD_WEIGHT_THRESHOLD:
            return None
        main = [f for f in fields if f.has(Required)]
        folded = [f for f in fields if not f.has(Required)]
        if not main or len(folded) < layout_inference.FOLD_MIN_OPTIONAL:
            return None
        return main, folded

    def prefer_tabs(self, cls, sections, read_only: bool) -> bool:
        """Sections-to-tabs rule (Java ``LayoutInference.preferTabs``): a read-only view with many
        substantial sections reads better with random access (tabs) than as a long vertical stack
        — and unlike an editable form, hiding groups cannot hide invalid required fields. (Java
        also bails on sticky sections and explicit @Toc/@Zones/@FoldedLayout — the Python backend
        has none of those layout features yet.)"""
        if not layout_inference.enabled(cls) or not read_only:
            return False
        if len(sections) < layout_inference.TABS_MIN_SECTIONS:
            return False
        total = sum(self.field_weight(cls, f) for _, fs in sections for f in fs)
        return total >= layout_inference.TABS_WEIGHT_THRESHOLD

    def folded_card(self, main, folded, instance, read_only: bool) -> ClientSideComponent:
        """The fold-optionals presentation (Java ``SectionFormRenderer.buildSectionBody``): the
        required fields' form layout, then a collapsed "More options" accordion panel hosting the
        optional fields — all inside the usual unnamed-section card."""
        main_layout = self.client(
            FormLayoutMetadata(),
            None,
            self.form_rows(self.map_fields(main, instance, read_only)),
        )
        folded_layout = self.client(
            FormLayoutMetadata(),
            None,
            self.form_rows(self.map_fields(folded, instance, read_only)),
        )
        panel = self.client(
            AccordionPanelMetadata(label=layout_inference.MORE_OPTIONS_LABEL),
            None,
            [folded_layout],
        )
        accordion = self.client(AccordionLayoutMetadata(), None, [panel])
        vlayout = self.client(VerticalLayoutMetadata(), None, [main_layout, accordion])
        div = self.client(DivMetadata(), "fieldId", [vlayout])
        return self.client(CardMetadata(content=div), "fieldId", [])

    def tabs_from_sections(self, sections, instance, read_only: bool) -> ClientSideComponent:
        """Sections-as-tabs presentation (Java ``SectionFormRenderer.tabsFromSections``): one tab
        per section (label = section title). The tab layout carries the group semantics and is
        marked adaptable so renderers may degrade it to an accordion on narrow viewports."""
        comps = []
        for i, (title_, fs) in enumerate(sections):
            form_layout = self.client(
                FormLayoutMetadata(),
                None,
                self.form_rows(self.map_fields(fs, instance, read_only)),
            )
            comps.append(
                self.client(
                    TabMetadata(label=self.T(title_) if title_ else "", active=i == 0),
                    None,
                    [form_layout],
                )
            )
        return self.client(
            TabLayoutMetadata(group_relationship="alternative", adaptable=True), "_tabs", comps
        )

    def build_zones(
        self, declared_zones, sections, section_zones, section_markers, instance, read_only
    ) -> ClientSideComponent:
        """Distributes sections into the @zones columns and lays them out side by side — each
        zone a VerticalLayout stacking its section cards, its width from the zone declaration;
        sections with an unrecognised zone fall into a trailing flexible column (mirrors Java's
        SectionFormRenderer.renderZones)."""

        def card_of(i):
            title, fields = sections[i]
            return self.section_card(
                title,
                self.map_fields(fields, instance, read_only),
                section_markers[i],
                titled=True,
            )

        def column(cards) -> ClientSideComponent:
            # Consolidated onto the one responsive grid (coherence-plan #9): the grid track sizes the
            # column, so the column is a bare VerticalLayout (mirrors Java's zoneColumn).
            return ClientSideComponent(
                metadata=VerticalLayoutMetadata(spacing=True), children=list(cards),
                style="min-width: 0;",
            )

        columns = []
        tracks: list[str] = []
        remaining = list(range(len(sections)))
        for name, width in declared_zones:
            mine = [i for i in remaining if section_zones[i] == name]
            if not mine:
                continue
            remaining = [i for i in remaining if i not in mine]
            columns.append(column(card_of(i) for i in mine))
            tracks.append(width if width else "1fr")
        if remaining:
            columns.append(column(card_of(i) for i in remaining))
            tracks.append("1fr")

        # Zone widths become grid tracks; stack_below collapses the row to one column on narrow
        # containers (mirrors Java's flushZonedRow — the old flex-wrap point was ~20rem/column).
        return ClientSideComponent(
            metadata=ResponsiveGridMetadata(
                grid_template_columns=" ".join(tracks), stack_below="40rem"
            ),
            children=columns,
            style="width: 100%; align-items: start;",
        )

    def section_card(
        self,
        title: str | None,
        fields,
        section: Section | None = None,
        labels_aside: bool = False,
        max_columns: int = 2,
        titled: bool = False,
        column_width: str | None = None,
    ) -> ClientSideComponent:
        # Section(property_list=True): every data field becomes a read-only property row (label
        # left / value right, divider between rows), stacked full-width — so the body is a plain
        # vertical layout instead of the responsive form layout (mirrors Java's
        # SectionFormRenderer.asPropertyList).
        if section is not None and section.property_list:
            body = ClientSideComponent(
                metadata=VerticalLayoutMetadata(horizontal_alignment="STRETCH"),
                children=[self._as_property_row(f) for f in fields],
                style="width: 100%;",
            )
        else:
            body = self.client(
                FormLayoutMetadata(
                    max_columns=max_columns, labels_aside=labels_aside, column_width=column_width
                ),
                None,
                self.form_rows(fields, max_columns),
            )
        # Section(add_action / edit_action / view_more_action): "Add"/"Edit" on the title row and
        # "View more" under the content (mirrors Java's SectionAffordances). The title row then
        # carries the section title itself, so the card is not titled again below.
        if section is not None and _has_affordances(section):
            body = self._with_affordances(section, title, body)
            titled = False
        # Section(frameless=True): no card wrapper, no padding — the content sits bare (mirrors
        # Java's @Section(frameless=true)).
        if section is not None and section.frameless:
            return ClientSideComponent(
                metadata=DivMetadata(),
                children=[body],
                style="flex: 1; min-width: 0; width:100%;",
            )
        # A titled section (one of several stacked/zoned sections) carries its title as an <h3>
        # Text inside the Card, and the Card itself takes the flex style.
        if titled and title:
            return self._titled_section_card(title, body)
        return self._section_card_wrapper(body)

    def _affordance_button(self, kind: str, method: str, label: str) -> ClientSideComponent:
        action_id = camel_case(method)
        return ClientSideComponent(
            metadata=ButtonMetadata(
                label=self.T(label), action_id=action_id, button_style="tertiary", size="small"
            ),
            id=f"{kind}-{action_id}",
            children=[],
        )

    def _with_affordances(
        self, section: Section, title: str | None, body: ClientSideComponent
    ) -> ClientSideComponent:
        """The section body with its affordances: a title row (the title — possibly blank — plus
        "Add" and "Edit", in that order) above it and a right-aligned "View more" under it."""
        top = []
        if section.add_action:
            top.append(self._affordance_button("section-add", section.add_action, "Add"))
        if section.edit_action:
            top.append(self._affordance_button("section-edit", section.edit_action, "Edit"))
        children: list = []
        if top:
            heading = ClientSideComponent(
                metadata=TextMetadata(text=self.T(title) if title else "", container="h3"),
                style=" flex: 1; margin: 0;",
            )
            children.append(ClientSideComponent(
                metadata=HorizontalLayoutMetadata(),
                children=[heading, *top],
                style="align-items: center; width: 100%;",
            ))
        elif title:
            children.append(ClientSideComponent(
                metadata=TextMetadata(text=self.T(title), container="h3"),
                style=" flex: 1; margin: 0;",
            ))
        children.append(body)
        if section.view_more_action:
            children.append(ClientSideComponent(
                metadata=HorizontalLayoutMetadata(),
                children=[self._affordance_button(
                    "section-view-more", section.view_more_action, "View more")],
                style="justify-content: flex-end; width: 100%;",
            ))
        return ClientSideComponent(
            metadata=VerticalLayoutMetadata(), children=children, style="width: 100%;"
        )

    def _titled_section_card(self, title: str, body: ClientSideComponent) -> ClientSideComponent:
        # Card(mateu-section, flex style) → VerticalLayout → [Text h3 title, VerticalLayout(width
        # 100%) → <body>] (mirrors Java's SectionFormRenderer when the section has a heading).
        heading = ClientSideComponent(
            metadata=TextMetadata(text=self.T(title), container="h3"),
            style=" flex: 1; margin: 0;",
        )
        inner = ClientSideComponent(
            metadata=VerticalLayoutMetadata(),
            children=[body],
            style="width: 100%;",
        )
        content = ClientSideComponent(
            metadata=VerticalLayoutMetadata(),
            children=[heading, inner],
        )
        return ClientSideComponent(
            metadata=CardMetadata(content=content),
            children=[],
            css_classes="mateu-section",
            style="flex: 1; min-width: 0; width:100%;",
        )

    @staticmethod
    def _section_card_wrapper(body: ClientSideComponent) -> ClientSideComponent:
        # A @Section maps to an outlined Card carrying the "mateu-section" marker class; its body
        # is nested under metadata.content as Div → VerticalLayout → <body> (mirrors Java's
        # SectionFormRenderer / CardMapper). The section TITLE does not travel as a FormSection —
        # it lives on the card in Java; here it is not re-emitted (the golden sections carry no
        # title member on the Card).
        vlayout = ClientSideComponent(
            metadata=VerticalLayoutMetadata(),
            children=[body],
            style="width: 100%;",
        )
        div = ClientSideComponent(
            metadata=DivMetadata(),
            children=[vlayout],
            style="flex: 1; min-width: 0; width:100%;",
        )
        return ClientSideComponent(
            metadata=CardMetadata(content=div),
            children=[],
            css_classes="mateu-section",
        )

    @staticmethod
    def _as_property_row(field: ClientSideComponent) -> ClientSideComponent:
        meta = field.metadata
        if not isinstance(meta, FormFieldMetadata) or meta.stereotype == "grid":
            return field
        return field.model_copy(
            update={
                "metadata": meta.model_copy(
                    update={"property_row": True, "read_only": True, "colspan": 1}
                )
            }
        )

    def map_fields(self, fields, instance, read_only: bool) -> list:
        """Maps declared fields to DTOs, inserting a full-width separator above any
        ``SeparatorBefore()`` field (mirrors Java's FormLayoutBuilder)."""
        out = []
        for f in fields:
            if f.has(SeparatorBefore):
                out.append(ClientSideComponent(
                    metadata=SeparatorMetadata(attributes={"data-colspan": "2"})))
            out.append(self.map_field(f, instance, read_only))
        return out

    #: Stereotypes that are intrinsically wide: in a multi-column form they span the whole row
    #: unless a Colspan() says otherwise (Java's FormLayoutBuilder.WIDE_STEREOTYPES).
    WIDE_STEREOTYPES = frozenset(("grid", "textarea", "richText", "html", "markdown"))

    def _widened(self, field, max_columns: int):
        meta = field.metadata
        if (
            max_columns > 1
            and isinstance(meta, CustomFieldMetadata)
            and isinstance(meta.content, ServerSideComponent)
            and EMBEDDED_MARKER in (meta.content.route or "")
            and (meta.colspan or 1) <= 1
        ):
            # an embedded island is a sub-app: always the whole row
            return field.model_copy(update={"metadata": meta.model_copy(update={"colspan": max_columns})})
        if (
            max_columns > 1
            and isinstance(meta, FormFieldMetadata)
            and (meta.colspan or 1) <= 1
            and meta.stereotype in self.WIDE_STEREOTYPES
        ):
            return field.model_copy(update={"metadata": meta.model_copy(update={"colspan": max_columns})})
        return field

    def form_rows(self, fields, max_columns: int = 2) -> list:
        rows: list = []
        pending: list = []
        used = 0  # columns consumed by the pending row (fields carry a colspan)
        for field in fields:
            field = self._widened(field, max_columns)
            # A separator always takes a full row of its own (data-colspan spans the columns).
            if isinstance(field.metadata, SeparatorMetadata):
                if pending:
                    rows.append(self.client(FormRowMetadata(), None, pending))
                    pending, used = [], 0
                rows.append(self.client(FormRowMetadata(), None, [field]))
                continue
            span = getattr(field.metadata, "colspan", 1) or 1
            # A field that would overflow the row's remaining columns starts a new row (a colspan=2
            # field thus always lands on its own row). Mirrors Java's FormLayoutBuilder.buildRows.
            if pending and used + span > max_columns:
                rows.append(self.client(FormRowMetadata(), None, pending))
                pending, used = [], 0
            pending.append(field)
            used += span
            if used >= max_columns:
                rows.append(self.client(FormRowMetadata(), None, pending))
                pending, used = [], 0
        if pending:
            rows.append(self.client(FormRowMetadata(), None, pending))
        return rows
