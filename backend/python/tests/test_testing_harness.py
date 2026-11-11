"""``mateu_ui.testing``: the public harness that drives a UI like a renderer, with no browser."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

import harness_app  # noqa: E402
from mateu_ui.testing import MateuTest, MateuTestError  # noqa: E402


@pytest.fixture
def mateu():
    harness_app.reset()
    return MateuTest(harness_app)


def test_the_shell_opens_on_its_home(mateu):
    screen = mateu.open("/")
    assert screen.menu == ["Products", "Greeting"]
    assert screen.listing().total == 3


def test_a_listing_shows_its_first_page(mateu):
    listing = mateu.open("/harness-products").listing()
    assert listing.total == 3
    assert listing.row(0)["name"] == "Espresso machine"


def test_a_listing_searches(mateu):
    screen = mateu.open("/harness-products")
    screen.listing().search("grinder")
    assert [r["name"] for r in screen.listing().rows] == ["Coffee grinder"]


def test_a_crud_creates_a_record(mateu):
    screen = mateu.open("/harness-products").button("New").press()
    screen.field("id").set("P-009")
    screen.field("Name").set("Tamper")
    screen.field("price").set(19.5)
    screen.field("status").set(harness_app.HarnessStatus.Available)
    screen.button("Save").press()
    assert harness_app.STORE["P-009"].name == "Tamper"


def test_a_row_opens_its_record(mateu):
    screen = mateu.open("/harness-products")
    screen.listing().row("Milk frother").open()
    assert screen.field("name").value == "Milk frother"


def test_a_form_action_shows_a_message(mateu):
    screen = mateu.open("/harness-greeting")
    screen.field("name").set("Ada")
    screen.button("greet").press()
    assert screen.last_message.text == "Hello Ada!"


def test_access_rules_follow_the_identity(mateu):
    assert not mateu.open("/harness-greeting").has_field("note")
    assert mateu.open("/harness-greeting", MateuTest.user("admin")).has_field("note")


def test_a_missing_element_says_what_there_is(mateu):
    screen = mateu.open("/harness-greeting")
    with pytest.raises(MateuTestError, match="name"):
        screen.field("nope")
