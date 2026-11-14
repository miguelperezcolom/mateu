"""A ``_private`` attribute of a view is the view's own plumbing — a service, a client, a cache —
never a form: its values are not sent in the state and the client cannot write it, whatever it
posts (GA review 2, Y6)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Message, button, ui  # noqa: E402

MODULE = sys.modules[__name__]


class Client:
    base_url: str = "https://internal"
    api_key: str = "PRIVATE-API-KEY"


@ui("private-attrs")
class WithAClient:
    name: str = ""
    _client: Client = None

    def __init__(self):
        self._client = Client()

    @button
    def save(self):
        return Message(f"{self.name} {self._client.base_url} {self._client.api_key}")


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def test_its_values_are_not_sent():
    out = json.dumps(handler().handle(RunActionRq(route="private-attrs")).model_dump(by_alias=True, mode="json"))
    assert "PRIVATE-API-KEY" not in out
    assert "https://internal" not in out


def test_the_client_cannot_write_it():
    inc = handler().handle(RunActionRq(
        route="private-attrs", server_side_type=type_name(WithAClient), action_id="save",
        component_state={
            "name": "n", "_client": {"baseUrl": "http://evil", "apiKey": "x"},
            "_client-baseUrl": "http://evil2", "_client-apiKey": "y",
            # the camelCased spellings the wire would use for it
            "Client": {"baseUrl": "http://evil3"}, "client": {"baseUrl": "http://evil4"},
            "Client-baseUrl": "http://evil5", "client-baseUrl": "http://evil6",
        },
    ))
    assert [m.text for m in inc.messages] == ["n https://internal PRIVATE-API-KEY"]
