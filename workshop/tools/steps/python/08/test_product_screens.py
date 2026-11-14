"""Workshop, lab 08: each screen of the Products CRUD shows its own fields — the creation form, the
detail and the editor."""

from datetime import date

from mateu_ui.testing import MateuTest

import views


def test_new_has_no_added_on_and_starts_as_available():
    form = MateuTest(views).open("/products").button("New").press()
    assert not form.has_field("addedOn")
    assert not form.field("id").read_only
    assert form.field("status").value == "Available"


def test_the_store_fills_in_what_new_does_not_show():
    form = MateuTest(views).open("/products").button("New").press()
    form.field("id").set("P-300")
    form.field("name").set("Tamper")
    form.field("price").set(19.5)
    form.button("Save").press()

    products = views.Products()
    assert products.get("P-300").added_on == date.today()
    products.delete("P-300")


def test_the_detail_shows_added_on_and_the_editor_keeps_it_read_only():
    mateu = MateuTest(views)
    assert mateu.open("/products/P-003").has_field("addedOn")

    editor = mateu.open("/products/P-003/edit")
    assert editor.field("id").read_only
    assert editor.field("addedOn").read_only
    assert not editor.field("name").read_only
