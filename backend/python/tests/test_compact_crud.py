"""@compact on a crud: its listing asks for dense rows (CrudMetadata.compact) and its page carries
the high-density preset with the --mateu-compact:1 marker — mirrors Java's CompactCrudSyncTest."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import Crud, compact, title, ui  # noqa: E402


class Room:
    id: str = ""
    name: str = ""

    def __init__(self, id: str = "", name: str = ""):
        self.id = id
        self.name = name


@ui("dense-rooms")
@title("Dense rooms")
@compact
class DenseRooms(Crud[Room]):
    element_type = Room

    def fetch(self, search):
        return [Room("1", "Room 1")]

    def save(self, entity):
        pass


@ui("airy-rooms")
@title("Airy rooms")
class AiryRooms(Crud[Room]):
    element_type = Room

    def fetch(self, search):
        return [Room("1", "Room 1")]

    def save(self, entity):
        pass


def render(route: str, cls) -> str:
    handler = SyncHandler(MateuRegistry(sys.modules[__name__]))
    return handler.handle(
        RunActionRq(route=route, serverSideType=f"{__name__}.{cls.__name__}")
    ).model_dump_json(by_alias=True)


def test_a_compact_crud_asks_for_dense_rows_and_carries_the_marker():
    wire = render("/dense-rooms", DenseRooms)
    assert '"compact":true' in wire
    assert "--mateu-compact:1" in wire


def test_a_crud_without_compact_stays_airy():
    wire = render("/airy-rooms", AiryRooms)
    assert '"compact":true' not in wire
    assert "--mateu-compact:1" not in wire
