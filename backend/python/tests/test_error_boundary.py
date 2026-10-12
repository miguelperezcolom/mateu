"""The error boundary — same contract as Java ErrorBoundarySyncTest and .NET ErrorBoundaryTests: an
exception meant for the user is shown as written, a bug becomes a generic message with a reference
(and an ERROR log line carrying it), and the endpoint answers a toast instead of a framework 500."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import error_boundary  # noqa: E402
from mateu_uidl import Message, UserFacingException, button, title, ui  # noqa: E402


@ui("err-probe")
@title("Error probe")
class ErrProbe:
    name: str | None = None

    @button()
    def out_of_stock(self):
        raise UserFacingException("Only 3 units left.", title="Not enough stock")

    @button()
    def bug(self):
        raise RuntimeError("SELECT * FROM orders failed")

    @button()
    def fine(self):
        return Message("ok")


MODULE = sys.modules[__name__]


def test_a_user_facing_exception_is_shown_as_written_even_when_chained():
    try:
        try:
            raise UserFacingException("Only 3 units left.", title="Not enough stock")
        except UserFacingException as inner:
            raise RuntimeError("wrapper") from inner
    except RuntimeError as wrapped:
        message = error_boundary.describe(wrapped, detailed=False)
    assert message["variant"] == "error"
    assert message["title"] == "Not enough stock"
    assert message["text"] == "Only 3 units left."
    assert error_boundary.describe(UserFacingException("Pick a date."))["title"] == "Error"


def test_a_validation_error_is_shown():
    pydantic = pytest.importorskip("pydantic")

    class Order(pydantic.BaseModel):
        quantity: int

    with pytest.raises(pydantic.ValidationError) as caught:
        Order(quantity="lots")
    message = error_boundary.describe(caught.value, detailed=False)
    assert message["title"] == "Validation error"
    # the field as the user knows it, not its programmer id (UX review): "Quantity: ..."
    assert message["text"].startswith("Quantity: ")


def test_a_validation_error_names_the_field_humanized():
    assert error_boundary._field_label(("start_date",)) == "Start date"
    assert error_boundary._field_label(("guests", 0, "lastName")) == "Last name"


def test_a_bug_is_generic_with_a_reference_that_the_error_log_carries(caplog):
    with caplog.at_level("ERROR", logger="mateu.errors"):
        message = error_boundary.describe(RuntimeError("SELECT * FROM orders failed"), "bug", detailed=False)
    assert message["title"] == error_boundary.GENERIC_TITLE
    assert message["text"].startswith(error_boundary.GENERIC_TEXT)
    assert "SELECT" not in message["text"]
    reference = message["text"][len(error_boundary.GENERIC_TEXT):]
    assert len(reference) == 12
    assert any(reference in r.getMessage() and r.exc_info for r in caplog.records)


def test_detailed_mode_shows_the_raw_exception():
    message = error_boundary.describe(RuntimeError("database down"), detailed=True)
    assert message["title"] == "RuntimeError"
    assert "database down" in message["text"]


def test_the_endpoint_answers_a_toast_instead_of_a_500():
    fastapi = pytest.importorskip("fastapi")
    from fastapi.testclient import TestClient

    from mateu_fastapi import add_mateu

    app = fastapi.FastAPI()
    add_mateu(app, MODULE)
    client = TestClient(app, raise_server_exceptions=False)
    stock = client.post("/mateu/v3/sync/err-probe", json={"route": "err-probe", "actionId": "outOfStock"})
    assert stock.status_code == 200
    assert "Only 3 units left." in stock.text
    bug = client.post("/mateu/v3/sync/err-probe", json={"route": "err-probe", "actionId": "bug"})
    assert bug.status_code == 200
    assert error_boundary.GENERIC_TEXT in bug.text
    assert "SELECT" not in bug.text
