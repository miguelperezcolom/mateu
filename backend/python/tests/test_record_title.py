"""A record page is named after the RECORD, as Java names it (PageMetadataExtractor.getTitle, used by
CrudFormComponentBuilder / EditableView): the entity's declared @title, else a __str__ the developer
wrote, else the humanized class name — never the crud's title ("Fasteners") and never a dataclass's
generated repr. Both the page header and the window title (mirror of the .NET RecordTitleTests)."""

import sys
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from pydantic import BaseModel  # noqa: E402

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.titles import record_title  # noqa: E402
from mateu_dtos import ClientSideComponent, PageMetadata, ServerSideComponent  # noqa: E402
from mateu_uidl import Crud, Listing, ListingData, Navigable, SearchRequest, title, ui  # noqa: E402


class Fastener:
    """An entity that NAMES itself."""

    id: str = ""
    name: str = ""

    def __str__(self):
        return self.name


def _fastener(id_, name):
    f = Fastener()
    f.id, f.name = id_, name
    return f


ALL = [_fastener("b1", "Bolt M8"), _fastener("w1", "Washer ${size}")]


@ui("fasteners")
@title("Fasteners")
class Fasteners(Crud[Fastener]):
    def fetch(self, search):
        return ALL

    def get(self, id):
        return next((f for f in ALL if f.id == id), None)


class Anonymous:
    """No __str__ of its own: object's is a type dump, not a record name."""

    id: str = ""
    name: str = ""


@ui("anonymous-records")
@title("Anonymous records")
class AnonymousRecords(Crud[Anonymous]):
    def fetch(self, search):
        return [Anonymous()]

    def get(self, id):
        return Anonymous()


@dataclass
class Note:
    """A dataclass: its generated repr ``Note(id='n1', text=…)`` is a field dump, not a name."""

    id: str = ""
    text: str = ""


@ui("notes-records")
@title("Notes")
class Notes(Crud[Note]):
    def fetch(self, search):
        return [Note("n1", "Buy milk")]

    def get(self, id):
        return Note(id, "Buy milk")


@dataclass
class NamedNote:
    id: str = ""
    text: str = ""

    def __str__(self):
        return "Note " + self.id


@ui("named-notes")
@title("Named notes")
class NamedNotes(Crud[NamedNote]):
    def fetch(self, search):
        return [NamedNote("n1", "Buy milk")]

    def get(self, id):
        return NamedNote(id, "Buy milk")


class Reading(BaseModel):
    """A pydantic model: BaseModel's __str__ is a field dump too."""

    id: str = ""
    value: int = 0


@ui("readings")
@title("Readings")
class Readings(Crud[Reading]):
    def fetch(self, search):
        return [Reading(id="r1", value=3)]

    def get(self, id):
        return Reading(id=id, value=3)


@title("Customer file")
class TitledCustomer:
    id: str = ""
    name: str = ""

    def __str__(self):
        return self.name


@ui("titled-customers")
@title("Customers")
class TitledCustomers(Crud[TitledCustomer]):
    def fetch(self, search):
        return [TitledCustomer()]

    def get(self, id):
        c = TitledCustomer()
        c.id, c.name = id, "Ann"
        return c


@ui("self-named-form")
class SelfNamedForm:
    """A plain @ui form whose instance names itself — the same rule, not only cruds."""

    name: str = "Draft"

    def __str__(self):
        return "Form of " + self.name


@ui("fastener-catalogue")
@title("Fastener catalogue")
class FastenerCatalogue(Listing[Fastener], Navigable[Fastener, str]):
    def search(self, request: SearchRequest) -> ListingData[Fastener]:
        return ListingData(rows=ALL)

    def view(self, id: str) -> Fastener:
        return next(f for f in ALL if f.id == id)


MODULE = sys.modules[__name__]


def _load(route: str):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(route=route, consumed_route=route))


def _find_page(component):
    if isinstance(component, ClientSideComponent) and isinstance(component.metadata, PageMetadata):
        return component.metadata
    children = component.children if isinstance(component, (ClientSideComponent, ServerSideComponent)) else None
    for child in children or []:
        found = _find_page(child)
        if found is not None:
            return found
    return None


def _titles(route: str):
    inc = _load(route)
    page = next((p for p in (_find_page(f.component) for f in inc.fragments) if p is not None), None)
    window = next((c.data for c in inc.commands if c.type == "SetWindowTitle"), None)
    return (page.title if page is not None else None, window)


def test_a_record_that_names_itself_titles_its_edit_page_and_the_window():
    assert _titles("fasteners/b1/edit") == ("Bolt M8", "Bolt M8")


def test_the_view_page_is_named_after_the_record_too():
    assert _titles("fasteners/b1") == ("Bolt M8", "Bolt M8")


def test_the_listing_keeps_the_cruds_declared_title():
    page, window = _titles("fasteners")
    assert window == "Fasteners"


def test_a_records_text_is_data_not_a_template():
    # "Washer ${size}" must not be interpolated by the renderer (Java's Templates.literal)
    assert _titles("fasteners/w1")[0] == "Washer \\${size}"


def test_an_entity_without_its_own_str_is_titled_by_its_class_name_not_the_cruds():
    assert _titles("anonymous-records/a1/edit") == ("Anonymous", "Anonymous")


def test_a_dataclass_generated_repr_is_a_field_dump_not_a_name():
    assert _titles("notes-records/n1/edit") == ("Note", "Note")


def test_a_pydantic_models_str_is_a_field_dump_not_a_name():
    assert _titles("readings/r1/edit") == ("Reading", "Reading")


def test_a_str_the_record_declares_itself_names_it():
    assert _titles("named-notes/n1") == ("Note n1", "Note n1")


def test_a_declared_title_on_the_entity_wins_over_its_str():
    assert _titles("titled-customers/c1/edit") == ("Customer file", "Customer file")


def test_the_new_form_is_titled_by_the_class_when_the_blank_record_has_no_name():
    # a fresh Fastener's name is "" — an empty name falls back to the class
    assert _titles("fasteners/new") == ("Fastener", "Fastener")


def test_a_plain_form_that_names_itself_is_titled_by_its_instance():
    assert _titles("self-named-form") == ("Form of Draft", "Form of Draft")


def test_a_capability_listings_detail_is_named_after_the_record():
    assert _titles("fastener-catalogue/b1") == ("Bolt M8", "Bolt M8")


def test_record_title_rule_directly():
    assert record_title(Fastener, _fastener("x", "Nut")) == "Nut"
    assert record_title(Fastener, None) == "Fastener"
    assert record_title(Note, Note("n", "t")) == "Note"
    assert record_title(Reading, Reading()) == "Reading"
    assert record_title(TitledCustomer, TitledCustomer()) == "Customer file"
