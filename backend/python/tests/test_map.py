"""The street map with markers — the Python mirror of Java's ``MapSyncTest``: the map travels with
its markers and marker action, the view advertises the marker action it handles, and a marker
click reaches the method with the marker id in ``_markerId``."""

import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.mapper import ReflectionMapper  # noqa: E402
from mateu_uidl import ComponentTreeSupplier, Message, action, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402


@ui("hotels-map")
@title("Hotels")
class HotelsMap(ComponentTreeSupplier):
    def component(self):
        return fluent.Map(
            id="hotels",
            zoom="12",
            marker_action_id="openHotel",
            markers=(
                fluent.MapMarker(
                    id="palma",
                    latitude=39.5696,
                    longitude=2.6502,
                    label="Hotel Palma",
                    description="120 rooms",
                    color="#c74634",
                ),
                fluent.MapMarker(id="port", latitude=39.5546, longitude=2.6236, label="Hotel Port"),
            ),
        )

    @action
    def open_hotel(self, request: RunActionRq) -> Message:
        return Message(f"Opened {(request.parameters or {}).get('_markerId')}")


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def test_the_map_travels_with_its_markers_and_marker_action():
    inc = handler().handle(RunActionRq(server_side_type=type_name(HotelsMap)))
    root = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    hosts = [
        n
        for n in walk(root)
        if any(
            isinstance(ch, dict) and (ch.get("metadata") or {}).get("type") == "Map"
            for ch in n.get("children") or []
        )
    ]
    assert len(hosts) == 1
    host = hosts[0]
    component = next(ch for ch in host["children"] if ch["metadata"]["type"] == "Map")
    assert component["id"] == "hotels"
    m = component["metadata"]
    assert m["zoom"] == "12"
    assert m["position"] is None
    assert m["markerActionId"] == "openHotel"
    assert len(m["markers"]) == 2
    palma = m["markers"][0]
    assert palma == {
        "id": "palma",
        "latitude": 39.5696,
        "longitude": 2.6502,
        "label": "Hotel Palma",
        "description": "120 rooms",
        "color": "#c74634",
    }
    # the view handles the marker action, so it is advertised and the client sends it
    assert "openHotel" in [a["id"] for a in host["actions"]]


def test_a_map_without_id_answers_as_map():
    dto = ReflectionMapper().map_component(fluent.Map(position="39.57, 2.65", zoom="10"))
    assert dto.id == "map"
    assert dto.metadata.markers == []
    assert dto.metadata.marker_action_id is None


def test_a_marker_click_runs_the_action_with_the_marker_id():
    inc = handler().handle(
        RunActionRq(
            route="/hotels-map",
            action_id="openHotel",
            server_side_type=type_name(HotelsMap),
            initiator_component_id="cmp-1",
            component_state={},
            parameters={"_markerId": "port"},
        )
    )
    assert [m.text for m in inc.messages] == ["Opened port"]
