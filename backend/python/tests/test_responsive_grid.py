"""ResponsiveGrid — one responsive grid as THE layout foundation (coherence-plan #9). The Python
mirror of Java's ResponsiveGridSyncTest / .NET's ResponsiveGrid_resolves_its_tracks: the column
tracks (sized with the #8 hug/fixed/fill vocabulary) resolve to a CSS grid-template-columns string
and the children travel as component children."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core.mapper import ReflectionMapper  # noqa: E402
from mateu_uidl.components import GridTrack, ResponsiveGrid, Slotted, Text  # noqa: E402


def test_tracks_resolve_to_a_css_grid_template_and_children_travel():
    grid = ResponsiveGrid(
        id="grid",
        columns=(GridTrack.hug(), GridTrack.fill(), GridTrack.fixed("15rem")),
        gap="1rem",
        content=(Text(id="a", text="A"), Text(id="b", text="B"), Text(id="c", text="C")),
    )
    dto = ReflectionMapper().map_component(grid)
    d = dto.model_dump(by_alias=True, mode="json")
    assert d["metadata"]["type"] == "ResponsiveGrid"
    assert d["metadata"]["gridTemplateColumns"] == "auto 1fr 15rem"
    assert d["metadata"]["gap"] == "1rem"
    assert len(d["children"]) == 3


def test_per_child_column_spans_travel():
    grid = ResponsiveGrid(
        columns=(GridTrack.fill(), GridTrack.fill()),
        col_spans=(2, 1, 1),
        content=(Text(text="band"), Text(text="A"), Text(text="B")),
    )
    d = ReflectionMapper().map_component(grid).model_dump(by_alias=True, mode="json")
    assert d["metadata"]["colSpans"] == [2, 1, 1]


def test_a_grid_with_no_columns_has_no_template():
    dto = ReflectionMapper().map_component(ResponsiveGrid(id="g", content=(Text(text="x"),)))
    assert dto.model_dump(by_alias=True, mode="json")["metadata"]["gridTemplateColumns"] is None


def test_a_template_carries_grid_areas_and_places_children_by_slot():
    # coherence-plan #7: a Screen = Template + slots on the one grid.
    areas = '"header header" "sidebar main"'
    grid = ResponsiveGrid.template(
        "screen",
        areas,
        [
            Slotted(slot="header", content=Text(text="H")),
            Slotted(slot="sidebar", content=Text(text="S")),
            Slotted(slot="main", content=Text(text="M")),
        ],
    )
    d = ReflectionMapper().map_component(grid).model_dump(by_alias=True, mode="json")
    assert d["metadata"]["gridTemplateAreas"] == areas
    assert [c["slot"] for c in d["children"]] == ["header", "sidebar", "main"]
