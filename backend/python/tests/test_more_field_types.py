"""Java's MoreFieldTypesSyncTest in the port: a datetime keeps its time (it was mapped as a DATE
and the time was lost on the round trip), a time is a time (it was not even seeded) and a big int
round-trips intact."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, time

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name
from mateu_uidl import Message, button, ui


@ui("/more-field-types")
@dataclass
class MoreFieldTypesForm:
    big: int = 12345678901234567890
    when: datetime = datetime(2026, 10, 17, 10, 15, 30)
    at: time = time(9, 30)
    name: str = "Ada"

    @button
    def echo(self) -> Message:
        return Message(text=f"{self.big}|{self.name}|{self.when.isoformat()}|{self.at.isoformat()}")


def _handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MoreFieldTypesForm))


def _fields(node, out):
    if isinstance(node, dict):
        if node.get("type") == "FormField":
            out[node.get("fieldId")] = node
        for v in node.values():
            _fields(v, out)
    elif isinstance(node, list):
        for v in node:
            _fields(v, out)
    return out


def test_each_type_maps_to_its_wire_data_type_and_value():
    inc = _handler().handle(RunActionRq(route="/more-field-types", consumedRoute="/more-field-types"))
    wire = json.loads(inc.model_dump_json(by_alias=True))
    fields = _fields(wire, {})
    assert fields["big"]["dataType"] == "integer"
    assert fields["when"]["dataType"] == "dateTime"
    assert fields["at"]["dataType"] == "time"
    text = json.dumps(wire)
    assert '"when": "2026-10-17T10:15:30"' in text
    assert '"at": "09:30"' in text


def test_their_values_round_trip_through_an_action():
    inc = _handler().handle(
        RunActionRq(
            route="/more-field-types",
            actionId="echo",
            serverSideType=type_name(MoreFieldTypesForm),
            componentState={
                "big": "98765432109876543210",
                "name": "Grace",
                "when": "2026-01-02T03:04:05",
                "at": "18:45",
            },
        )
    )
    assert inc.messages[0].text == "98765432109876543210|Grace|2026-01-02T03:04:05|18:45:00"
