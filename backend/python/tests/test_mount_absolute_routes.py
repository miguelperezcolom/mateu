"""An app mounted under a sub-path accepts routes WITH its mount, as Java does (there the mount is
stripped): a notification / global-search hit or a deep link names ``/shell/probe``, and answering
"Route not found" (or the shell again) for it broke those flows on a non-root Python app."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import app, menu_item, ui  # noqa: E402


@ui("mounted-probe")
class MountedProbe:
    name: str = "x"


@ui("mshell")
@app("Mounted shell")
class MountedShell:
    @menu_item("Probe")
    def probe(self) -> MountedProbe:
        return MountedProbe()


def run(**kw):
    handler = SyncHandler(MateuRegistry(MountedProbe, MountedShell))
    return json.loads(handler.handle(RunActionRq(**kw)).model_dump_json(by_alias=True))


def test_the_shells_content_load_of_a_mount_absolute_route_loads_the_view():
    body = run(route="/mshell/mounted-probe", consumed_route="/mshell", server_side_type=type_name(MountedShell))
    assert not body["messages"]
    assert body["fragments"][0]["component"]["serverSideType"] == type_name(MountedProbe)


def test_a_mount_absolute_route_with_no_type_resolves_like_the_relative_one():
    body = run(route="/mshell/mounted-probe", consumed_route="", server_side_type=None)
    assert not body["messages"]
    assert body["fragments"][0]["component"]["serverSideType"] == type_name(MountedProbe)
