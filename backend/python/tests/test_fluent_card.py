"""A fluent ``Card`` with Java's shape: every slot (title included) is a component (owner,
2026-10-12). The port had no fluent Card, and its card metadata took a string title."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, SyncHandler  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402


def test_a_fluent_card_maps_every_slot_as_a_component():
    card = fluent.Card(
        id="booking",
        title=fluent.Text(text="Booking 4471"),
        subtitle=fluent.Text(text="Two nights"),
        content=fluent.Text(text="Room 12"),
        footer=fluent.Text(text="Paid"),
        variants=["elevated"],
    )
    wire = json.loads(
        SyncHandler(MateuRegistry()).mapper.map_component(card).model_dump_json(by_alias=True)
    )
    meta = wire["metadata"]
    assert wire["id"] == "booking"
    assert meta["type"] == "Card"
    assert meta["title"]["metadata"] == {**meta["title"]["metadata"], "type": "Text", "text": "Booking 4471"}
    assert meta["subtitle"]["metadata"]["text"] == "Two nights"
    assert meta["content"]["metadata"]["text"] == "Room 12"
    assert meta["footer"]["metadata"]["text"] == "Paid"
    assert meta["variants"] == ["elevated"]
