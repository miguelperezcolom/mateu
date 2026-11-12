"""``mateu_ui.testing``: overlays, commands, errors, listing gestures and the failure messages."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

import harness_app  # noqa: E402
import harness_more_app  # noqa: E402
from mateu_ui.testing import Command, MateuTest, MateuTestError, Message  # noqa: E402
from mateu_ui.testing import _contains_text, _for_the_user  # noqa: E402
from mateu_ui.uidl import UserFacingException  # noqa: E402


@pytest.fixture
def mateu():
    harness_app.reset()
    harness_more_app.CALLS.clear()
    return MateuTest(harness_app, harness_more_app)


def test_fields_describe_themselves(mateu):
    screen = mateu.open("/harness-actions")
    assert screen.title == "Actions"
    assert screen.page_title in ("Actions", "")
    name = screen.field("name")
    assert name.required and name.text == "Ada" and name.data_type
    assert repr(name) == "name = Ada"
    assert screen.field("code").read_only
    with pytest.raises(MateuTestError, match="not editable"):
        screen.field("code").set("X-2")
    size = screen.field("size")
    assert [label for _, label in size.options] == ["Small", "Large"]
    assert isinstance(size.stereotype, str)
    assert screen.shows("Ada")
    assert not screen.shows("nothing like this")
    assert screen.state["name"] == "Ada"
    assert isinstance(screen.component, dict)
    assert screen.has_button("drawer") and not screen.has_button("nope")
    assert "drawer" in repr(screen.button("drawer"))


def test_a_value_change_runs_the_trigger(mateu):
    mateu.open("/harness-actions").field("size").set(harness_more_app.Size.Large)
    assert harness_more_app.CALLS == ["changed:Size.Large"]


def test_a_drawer_opens_and_closes(mateu):
    screen = mateu.open("/harness-actions").button("drawer").press()
    assert screen.has_overlay and screen.overlay_title == "Details"
    assert screen.shows("Inside the drawer")
    screen.close_overlay()
    assert not screen.has_overlay and screen.overlay_title == ""
    with pytest.raises(MateuTestError, match="No dialog or drawer"):
        screen.close_overlay()


def test_a_navigation_command_is_followed(mateu):
    screen = mateu.open("/harness-actions").button("go").press()
    assert screen.route == "harness-target"
    assert screen.field("note").value == "arrived"
    assert any(c.type == "NavigateTo" for c in screen.commands)


def test_commands_are_applied(mateu):
    screen = mateu.open("/harness-actions")
    screen.button("titled").press()
    assert screen.title == "A new title"
    screen.button("again").press()
    assert harness_more_app.CALLS == ["ping"]
    assert screen.last_message.text == "pong"
    assert not screen.last_message.is_error
    screen.run("close")
    assert not screen.has_overlay


def test_a_refusal_is_a_message_and_a_bug_is_raised(mateu):
    screen = mateu.open("/harness-actions").button("refuse").press()
    assert screen.last_message.is_error
    assert "Not now" in screen.last_message.text + screen.last_message.title
    with pytest.raises(RuntimeError, match="a bug"):
        screen.button("boom").press()


def test_failures_say_what_there_is(mateu):
    screen = mateu.open("/harness-target")
    with pytest.raises(MateuTestError, match="No button"):
        screen.button("nope")
    with pytest.raises(MateuTestError, match="No listing"):
        screen.listing()
    assert not screen.has_listing
    with pytest.raises(MateuTestError, match="no message"):
        screen.last_message
    assert screen.messages == []


def test_listing_gestures(mateu):
    screen = mateu.open("/harness-products")
    listing = screen.listing()
    assert listing.columns and len(listing.columns) == len(listing.column_labels)
    assert "Listing(" in repr(listing)
    row = listing.row(1)
    assert row["name"] == "Coffee grinder" and repr(row) == repr(row.values)
    with pytest.raises(MateuTestError, match="no row 9"):
        listing.row(9)
    with pytest.raises(MateuTestError, match="No row shows"):
        listing.row("nothing")
    listing.row("Milk frother").select()
    assert screen.state  # the selection travels in the state
    screen.listing().page(0)
    assert screen.listing().total == 3
    screen.listing().filter("searchText", "milk")
    assert [r["name"] for r in screen.listing().rows] == ["Milk frother"]
    screen.listing().search(None)
    assert screen.listing().total == 3


def test_the_raw_exchange_and_the_helpers(mateu):
    answer = mateu.exchange({"route": "harness-target", "consumedRoute": "_empty", "actionId": ""})
    assert answer["fragments"]
    assert repr(Message({"variant": "error", "title": "T", "text": "x"})) == "Message('error', 'T', 'x')"
    assert repr(Command("NavigateTo", "/x")) == "Command('NavigateTo', '/x')"
    assert MateuTest.user("admin").roles == ("admin",)
    assert _for_the_user(RuntimeError("x")) is False
    wrapped = RuntimeError("outer")
    wrapped.__cause__ = UserFacingException("inner")
    assert _for_the_user(wrapped) is True
    assert _contains_text({"label": ["a", 3]}, "3")
    assert not _contains_text({"id": "secret"}, "secret")
    assert not _contains_text(True, "True")


def test_history_loops_and_disabled_buttons(mateu):
    screen = mateu.open("/harness-actions")
    screen.button("pushed").press()
    assert screen.route == "/harness-actions/pushed"
    with pytest.raises(MateuTestError, match="keeps loading"):
        screen.button("loop").press()
    with pytest.raises(MateuTestError, match="disabled"):
        mateu.open("/harness-actions").button("Admin only").press()
    admin = mateu.open("/harness-actions", MateuTest.user("admin"))
    assert admin.button("Admin only").enabled
    assert admin.button("Admin only").press().last_message.text == "admin"


def test_a_record_is_edited_and_rows_are_deleted(mateu):
    screen = mateu.open("/harness-products")
    screen.listing().row("Milk frother").open()
    assert screen.route == "/harness-products/P-003"
    assert screen.field("price").read_only
    screen.button("Edit").press()
    screen.field("price").set(42.0)
    screen.button("Save").press()
    assert harness_app.STORE["P-003"].price == 42.0
    screen = mateu.open("/harness-products")
    screen.listing().row("Coffee grinder").select()
    screen.button("Delete").press()
    assert "P-002" not in harness_app.STORE
