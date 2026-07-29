"""The capability listing model, combination by combination — the Python mirror of Java's
CapabilityListingSyncTest: a listing is a class deriving from ``Listing[Row]`` (rows only —
sorting and pagination come free), and every further feature appears because the class DECLARES
it — ``Searchable`` the search box, ``Filterable[F]`` the filter bar, ``Navigable`` clickable
rows + detail route, ``Editable`` the editor (in a drawer when not navigable), ``Creatable``
the New button + create form, ``Deletable`` row selection + the Delete button."""

import json
import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.registry import type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Creatable,
    Deletable,
    Editable,
    Filterable,
    Listing,
    Navigable,
    NumberRange,
    Searchable,
    SearchRequest,
    list_toolbar_button,
    title,
    ui,
)


class Book:
    id: str = ""
    title: str = ""
    pages: int = 0

    def __init__(self, id: str = "", title: str = "", pages: int = 0):
        self.id = id
        self.title = title
        self.pages = pages


BOOKS = [Book("b1", "El Quijote", 863), Book("b2", "Rayuela", 600)]


# ── fixtures: one class per combination ───────────────────────────────────────


@ui("plain-books")
@title("Books")
class PlainBooks(Listing[Book]):
    last_request: SearchRequest | None = None

    def search(self, request, http=None):
        PlainBooks.last_request = request
        return list(BOOKS)


@ui("searchable-books")
class SearchableBooks(Listing[Book], Searchable):
    last_search_text: str | None = None

    def search(self, request, http=None):
        SearchableBooks.last_search_text = request.search_text
        return list(BOOKS)


class BookFilters:
    title: str | None = None
    pages: NumberRange | None = None


@ui("filterable-books")
class FilterableBooks(Listing[Book], Filterable[BookFilters]):
    last_filters: BookFilters | None = None

    def search(self, request, http=None):
        filters = self.filters(request)
        FilterableBooks.last_filters = filters
        return [
            b for b in BOOKS
            if (filters.title is None or filters.title.lower() in b.title.lower())
            and (filters.pages is None or filters.pages.contains(b.pages))
        ]


@ui("navigable-books")
class NavigableBooks(Listing[Book], Navigable[Book, str]):
    def search(self, request, http=None):
        return list(BOOKS)

    def view(self, id, http=None):
        return next(b for b in BOOKS if b.id == id)


@ui("editable-books")
class EditableBooks(Listing[Book], Editable[Book, str]):
    last_saved_title: str | None = None

    def search(self, request, http=None):
        return list(BOOKS)

    def edit(self, id, http=None):
        return next(b for b in BOOKS if b.id == id)

    def save(self, editor, http=None):
        EditableBooks.last_saved_title = editor.title
        return editor.id


@ui("creatable-books")
class CreatableBooks(Listing[Book], Creatable[Book, str]):
    last_created_title: str | None = None

    def search(self, request, http=None):
        return list(BOOKS)

    def creation_form(self, http=None):
        return Book()

    def create(self, form, http=None):
        CreatableBooks.last_created_title = form.title
        return "b3"


@ui("deletable-books")
class DeletableBooks(Listing[Book], Deletable[str]):
    last_deleted: list[str] | None = None

    def search(self, request, http=None):
        return list(BOOKS)

    def delete_all_by_id(self, selected_ids, http=None):
        DeletableBooks.last_deleted = selected_ids


@ui("bulk-books")
class BulkBooks(Listing[Book], Deletable[str]):
    last_archived: list[str] | None = None

    def search(self, request, http=None):
        return list(BOOKS)

    def delete_all_by_id(self, selected_ids, http=None):
        pass

    @list_toolbar_button()
    def archive(self, selection: list[Book], http=None):
        BulkBooks.last_archived = [b.id for b in selection]


MODULE = sys.modules[__name__]


# ── helpers ───────────────────────────────────────────────────────────────────


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


def load(route: str):
    return handler().handle(RunActionRq(route=route, consumed_route=route))


def run(cls, route: str, action_id: str, state: dict | None = None, parameters: dict | None = None):
    return handler().handle(RunActionRq(
        route=route,
        consumed_route=route,
        server_side_type=type_name(cls),
        action_id=action_id,
        initiator_component_id="cap_app",
        component_state=state or {},
        parameters=parameters or {},
    ))


def walk(node):
    if not isinstance(node, dict):
        return
    yield node
    meta = node.get("metadata")
    if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
        yield from walk(meta["content"])
    for child in node.get("children") or []:
        yield from walk(child)


def listing_of(inc) -> dict:
    doc = inc.model_dump(by_alias=True, mode="json")
    for fragment in doc.get("fragments") or []:
        for node in walk(fragment.get("component")):
            meta = node.get("metadata")
            if isinstance(meta, dict) and meta.get("type") == "Crud":
                return meta
    raise AssertionError("no Crud metadata in the increment")


def first_column_action_id(crudl: dict):
    return crudl["columns"][0]["metadata"].get("actionId")


def toolbar_action_ids(crudl: dict) -> list[str]:
    return [b.get("actionId") for b in crudl.get("toolbar") or []]


# ── rows only ─────────────────────────────────────────────────────────────────


def test_a_bare_listing_has_no_search_box_no_filters_no_buttons_and_no_clickable_rows():
    crudl = listing_of(load("plain-books"))
    assert crudl["searchable"] is False
    assert crudl["filters"] == []
    assert "new" not in toolbar_action_ids(crudl)
    assert "delete" not in toolbar_action_ids(crudl)
    assert crudl["rowsSelectionEnabled"] is False
    assert first_column_action_id(crudl) is None


def test_a_bare_listing_always_receives_an_empty_search_text():
    PlainBooks.last_request = None
    run(PlainBooks, "plain-books", "search", {"searchText": "quijote"})
    assert PlainBooks.last_request is not None
    assert PlainBooks.last_request.search_text == ""
    assert PlainBooks.last_request.filters is None


# ── + Searchable ──────────────────────────────────────────────────────────────


def test_searchable_shows_the_search_box_and_the_typed_text_reaches_the_request():
    crudl = listing_of(load("searchable-books"))
    assert crudl["searchable"] is True

    run(SearchableBooks, "searchable-books", "search", {"searchText": "quijote"})
    assert SearchableBooks.last_search_text == "quijote"


# ── + Filterable ──────────────────────────────────────────────────────────────


def test_filterable_shows_the_filter_bar_built_from_the_filters_type():
    crudl = listing_of(load("filterable-books"))
    assert crudl["searchable"] is False
    filter_ids = {f["fieldId"]: f for f in crudl["filters"]}
    assert set(filter_ids) == {"title", "pages"}
    # a typed NumberRange field renders the min-max range widget
    assert filter_ids["pages"]["stereotype"] == "numberRange"


def test_filterable_search_receives_the_hydrated_typed_filters():
    inc = run(FilterableBooks, "filterable-books", "search", {"pages_from": "700"})
    j = render(inc)
    assert FilterableBooks.last_filters is not None
    assert FilterableBooks.last_filters.pages == NumberRange(from_=700.0, to=None)
    assert '"totalElements": 1' in j
    assert "El Quijote" in j
    assert "Rayuela" not in j


# ── + Navigable ───────────────────────────────────────────────────────────────


def test_navigable_makes_rows_clickable_and_serves_the_detail_route():
    crudl = listing_of(load("navigable-books"))
    assert first_column_action_id(crudl) == "view"
    # still no create/delete chrome — only what was declared
    assert "new" not in toolbar_action_ids(crudl)
    assert "delete" not in toolbar_action_ids(crudl)

    detail = handler().handle(RunActionRq(
        route="navigable-books/b1",
        consumed_route="navigable-books",
        server_side_type=type_name(NavigableBooks),
        initiator_component_id="cap_app",
    ))
    assert "El Quijote" in render(detail)


def test_navigable_row_click_navigates_to_the_detail():
    inc = run(NavigableBooks, "navigable-books", "view", parameters={"id": "b1"})
    assert any(c.type == "NavigateTo" and c.data == "/navigable-books/b1" for c in inc.commands)


# ── + Editable (without Navigable) ────────────────────────────────────────────


def test_editable_without_navigable_opens_the_editor_in_a_drawer_and_save_persists():
    crudl = listing_of(load("editable-books"))
    # the editable-listing idiom: the first column opens the EDITOR (drawer), not a view page
    assert first_column_action_id(crudl) == "view"

    edit_inc = run(EditableBooks, "editable-books", "view", {"id": "b1"})
    assert len(edit_inc.fragments) == 1
    assert edit_inc.fragments[0].action == "Add"
    j = render(edit_inc)
    assert '"type": "Drawer"' in j
    assert "El Quijote" in j
    # the drawer's Save dispatches the Editable capability's save action
    assert '"actionId": "save"' in j

    save_inc = run(
        EditableBooks, "editable-books", "save",
        {"id": "b1", "title": "El Quijote (anotado)", "pages": 900},
    )
    assert EditableBooks.last_saved_title == "El Quijote (anotado)"
    # no navigation: the drawer closes emitting the saved event and the listing re-searches
    types = [c.type for c in save_inc.commands]
    assert "NavigateTo" not in types
    assert "CloseModal" in types
    assert "RunAction" in types


# ── + Creatable ───────────────────────────────────────────────────────────────


def test_creatable_adds_the_new_button_and_create_persists():
    crudl = listing_of(load("creatable-books"))
    assert "new" in toolbar_action_ids(crudl)
    assert "delete" not in toolbar_action_ids(crudl)

    run(CreatableBooks, "creatable-books", "create", {"title": "Nuevo libro", "pages": 100})
    assert CreatableBooks.last_created_title == "Nuevo libro"


def test_creatable_serves_the_new_route_with_the_creation_form():
    inc = handler().handle(RunActionRq(
        route="creatable-books/new",
        consumed_route="creatable-books",
        server_side_type=type_name(CreatableBooks),
        initiator_component_id="cap_app",
    ))
    j = render(inc)
    assert '"actionId": "create"' in j
    assert '"actionId": "cancel-new"' in j


# ── + Deletable ───────────────────────────────────────────────────────────────


def test_deletable_enables_selection_and_the_delete_button():
    crudl = listing_of(load("deletable-books"))
    assert crudl["rowsSelectionEnabled"] is True
    assert "delete" in toolbar_action_ids(crudl)
    assert "new" not in toolbar_action_ids(crudl)

    run(
        DeletableBooks, "deletable-books", "delete",
        {"crud_selected_items": [{"id": "b1"}]},
    )
    assert DeletableBooks.last_deleted == ["b1"]


# ── @list_toolbar_button methods on the listing itself (behaviourSource) ──────


def test_bulk_methods_declared_on_the_listing_become_toolbar_buttons_and_are_invoked():
    crudl = listing_of(load("bulk-books"))
    assert "action-on-row-archive" in toolbar_action_ids(crudl)

    run(
        BulkBooks, "bulk-books", "action-on-row-archive",
        {"crud_selected_items": [{"id": "b1", "title": "El Quijote", "pages": 863}]},
    )
    assert BulkBooks.last_archived == ["b1"]
