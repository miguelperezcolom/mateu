"""Workshop, lab 03: the screens you added in lab 01, tested the way a user uses them — no browser,
no server. The harness reads the very answer every renderer draws, so a passing test holds on
Vaadin, Redwood, the phone and the desktop app alike."""

from mateu_ui.testing import MateuTest

import views


def test_the_menu_has_a_quote_entry():
    assert "Quote" in MateuTest(views).open("/").menu


def test_calculate_fills_in_the_total():
    # lab 06: the discount is a manager's (EyesOnly), so open the quote as one
    quote = MateuTest(views).open("/quote", MateuTest.user("manager"))
    quote.field("quantity").set(3)
    quote.field("unitPrice").set(10.0)
    quote.field("discount").set(10)
    quote.button("Calculate").press()

    assert quote.field("total").value == 27.0
    assert quote.field("total").read_only
    assert "27" in quote.last_message.text


def test_the_stock_is_a_column_of_the_listing():
    assert "stock" in MateuTest(views).open("/products").listing().columns


def test_a_negative_stock_is_rejected():
    form = MateuTest(views).open("/products").button("New").press()
    form.field("id").set("P-200")
    form.field("name").set("Scale")
    form.field("price").set(25.0)
    form.field("stock").set(-1)
    form.field("status").set(views.ProductStatus.Available)
    form.button("Save").press()

    assert form.last_message.is_error
    assert views.Products().get("P-200") is None
