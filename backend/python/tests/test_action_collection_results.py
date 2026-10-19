"""An action returning a collection that holds the view — ``[self, Message("Saved")]`` — re-renders
the view with its new state AND shows the rest (Java's FragmentListMapper + CommandMapper over a
returned Collection, .NET's SyncHandler.RunAction). The port used to map each element on its own,
and the view itself maps to nothing outside ``return self``: the toast showed, the screen kept its
old values."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.uidl import Message, PageBanner, button, title, ui  # noqa: E402


@ui("collection-results")
@title("Counter")
class CounterView:
    count: int = 0

    @button()
    def bump_and_tell(self):
        self.count = self.count + 1
        return [self, Message("Bumped")]

    @button()
    def tell_and_bump(self):
        self.count = self.count + 1
        return (Message("Bumped"), self, PageBanner(title="Heads up"))

    @button()
    def just_bump(self):
        self.count = self.count + 1
        return self


MODULE = sys.modules[__name__]


def run(action_id: str):
    h = SyncHandler(MateuRegistry(MODULE))
    return h.handle(
        RunActionRq(
            route="collection-results",
            consumed_route="collection-results",
            action_id=action_id,
            component_state={"count": 4},
        )
    )


def state_of(inc) -> dict:
    dumped = json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))
    for fragment in dumped.get("fragments") or []:
        component = fragment.get("component") or {}
        for candidate in (fragment.get("state"), component.get("initialData"), component.get("state")):
            if isinstance(candidate, dict) and "count" in candidate:
                return candidate
    raise AssertionError(f"no re-rendered state in {dumped}")


def test_returning_self_re_renders_with_the_new_state():
    assert state_of(run("justBump"))["count"] == 5


def test_a_list_holding_the_view_re_renders_it_and_shows_the_message():
    inc = run("bumpAndTell")
    assert state_of(inc)["count"] == 5
    assert [m.text for m in inc.messages] == ["Bumped"]


def test_any_position_and_a_tuple_work_and_the_rest_keeps_its_order():
    inc = run("tellAndBump")
    assert state_of(inc)["count"] == 5
    assert [m.text for m in inc.messages] == ["Bumped"]
    assert [b.title for b in inc.banners] == ["Heads up"]
