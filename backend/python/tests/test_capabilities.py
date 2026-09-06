"""Capability descriptor — the Python mirror of Java's ``CapabilitiesSyncTest``.

An app advertises, on ``AppMetadata.requiredCapabilities``, the tokens it needs from whatever
renderer/shell hosts it — so a host can check it PROVIDES them all instead of rendering a broken
screen. Compatibility by capability, not by version. Most tokens are DERIVED from the app's own
metadata (it needs ``command-center`` because it opted in); a developer can DECLARE extra ones via
``@app(requires=[...])``.
"""

import json
import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core import capabilities  # noqa: E402
from mateu_uidl import Message, app, button, menu_item, title, ui  # noqa: E402


@ui("caps-home")
@title("Caps home")
class CapsHome:
    name: str | None = None

    @button()
    def greet(self) -> Message:
        return Message("hi")


@app("Plain app")
class PlainApp:
    @menu_item("Home")
    def home(self) -> "CapsHome":
        return CapsHome()


@app("Rich app", command_center=True, requires=["my-custom-widget"])
class RichApp:
    @menu_item("Home")
    def home(self) -> "CapsHome":
        return CapsHome()


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def caps(cls) -> list[str]:
    inc = handler().handle(RunActionRq(server_side_type=type_name(cls)))
    meta = json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))[
        "fragments"
    ][0]["component"]["metadata"]
    return meta["requiredCapabilities"]


def test_a_plain_app_does_not_require_features_it_never_declared():
    # It may still carry ambient, deployment-wide capabilities — but never a feature this
    # particular app did not opt into.
    c = caps(PlainApp)
    assert capabilities.COMMAND_CENTER not in c
    assert "my-custom-widget" not in c


def test_a_derived_capability_is_advertised():
    # command center opted in → the app needs a renderer that provides it.
    assert capabilities.COMMAND_CENTER in caps(RichApp)


def test_an_explicitly_declared_capability_is_advertised():
    assert "my-custom-widget" in caps(RichApp)


def test_the_descriptor_is_sorted_and_deduped():
    c = caps(RichApp)
    assert c == sorted(c)
    assert len(c) == len(set(c))
