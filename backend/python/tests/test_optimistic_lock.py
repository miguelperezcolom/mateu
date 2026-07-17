"""Optimistic locking (``Version()``) — the Python mirror of Java's ``OptimisticLockSyncTest``:
saving over someone else's save is rejected with a conflict dialog (reload / overwrite); a normal
save bumps the version; the dialog's overwrite button re-dispatches the save with
``_forceOverwrite`` and wins explicitly, adopting the stored version before bumping so the stale
one is never resurrected."""

import json
import sys
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.sync_handler import version_field  # noqa: E402
from mateu_uidl import Crud, Version, title, ui  # noqa: E402


class Article:
    id: str = ""
    name: str = ""
    version: Annotated[int, Version()] = 0


_ARTICLES: dict[str, Article] = {}


def _article(id_, name, version):
    a = Article()
    a.id, a.name, a.version = id_, name, version
    return a


@ui("locked-articles")
@title("Articles")
class ArticlesCrud(Crud[Article]):
    def fetch(self, search):
        return _ARTICLES.values()

    def get(self, id_):
        return _ARTICLES.get(id_)

    def save(self, entity):
        _ARTICLES[entity.id] = entity


class Invoice:
    id: str = ""
    concept: str = ""


_INVOICES: dict[str, Invoice] = {}


@ui("unlocked-invoices")
@title("Invoices")
class InvoicesCrud(Crud[Invoice]):
    def fetch(self, search):
        return _INVOICES.values()

    def get(self, id_):
        return _INVOICES.get(id_)

    def save(self, entity):
        _INVOICES[entity.id] = entity


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    # ensure_ascii=False so the Spanish conflict texts can be asserted byte-identical (accents).
    return json.dumps(inc.model_dump(by_alias=True, mode="json"), ensure_ascii=False)


def _seed():
    _ARTICLES.clear()
    _ARTICLES["1"] = _article("1", "Original", 1)


def _save(name, version, parameters=None):
    return handler().handle(
        RunActionRq(
            route="/locked-articles/1",
            consumed_route="/locked-articles",
            server_side_type=type_name(ArticlesCrud),
            action_id="save",
            initiator_component_id="c1_app",
            component_state={"id": "1", "name": name, "version": version},
            parameters=parameters or {},
        )
    )


def test_a_normal_save_bumps_the_version():
    _seed()
    inc = _save("Renamed", 1)
    assert "Modificado por otro usuario" not in render(inc)
    stored = _ARTICLES["1"]
    assert stored.name == "Renamed"
    assert stored.version == 2


def test_a_stale_save_is_rejected_with_the_conflict_dialog_and_nothing_is_persisted():
    _seed()
    # someone else saved first: stored version moves to 2
    _save("Their change", 1)
    # my editor still carries version 1 → conflict
    inc = _save("My change", 1)
    assert len(inc.fragments) == 1
    assert inc.fragments[0].action == "Add"
    assert inc.fragments[0].target_component_id == "c1_app"
    j = render(inc)
    assert '"headerTitle": "Modificado por otro usuario"' in j
    assert (
        "Este registro ha cambiado mientras lo editabas. Puedes recargar para ver los cambios"
        " (perdiendo los tuyos) o sobrescribir con tu versión." in j
    )
    # Recargar re-opens the stored record, Sobrescribir re-dispatches save with _forceOverwrite.
    assert '"label": "Recargar", "actionId": "cancel-edit"' in j
    assert '"label": "Sobrescribir", "actionId": "save"' in j
    assert '"buttonStyle": "primary", "parameters": {"_forceOverwrite": true}' in j
    stored = _ARTICLES["1"]
    assert stored.name == "Their change"
    assert stored.version == 2


def test_c_overwrite_from_the_dialog_wins_explicitly_and_keeps_moving_the_version_forward():
    _seed()
    _save("Their change", 1)
    # the dialog's Sobrescribir button re-dispatches save with _forceOverwrite
    inc = _save("My change", 1, parameters={"_forceOverwrite": True})
    assert "Modificado por otro usuario" not in render(inc)
    stored = _ARTICLES["1"]
    assert stored.name == "My change"
    # adopted the stored version (2) then bumped: never back to a stale number
    assert stored.version == 3


def test_d_entities_without_a_version_field_are_untouched_by_the_lock():
    assert version_field(Invoice) is None
    # …and a versionless save works exactly as before (no check, no bump, no dialog).
    _INVOICES.clear()
    _INVOICES["7"] = InvoicesCrud().get("7") or Invoice()
    _INVOICES["7"].id, _INVOICES["7"].concept = "7", "Original"
    inc = handler().handle(
        RunActionRq(
            route="/unlocked-invoices/7",
            consumed_route="/unlocked-invoices",
            server_side_type=type_name(InvoicesCrud),
            action_id="save",
            component_state={"id": "7", "concept": "Renamed"},
        )
    )
    assert "Modificado por otro usuario" not in render(inc)
    assert _INVOICES["7"].concept == "Renamed"


def _update_row(row, parameters=None):
    return handler().handle(
        RunActionRq(
            action_id="update-row",
            server_side_type=type_name(ArticlesCrud),
            initiator_component_id="c1_app",
            parameters={"_editedRow": row, **(parameters or {})},
        )
    )


def test_a_stale_inline_row_edit_answers_the_conflict_dialog_with_the_edited_row():
    _seed()
    _ARTICLES["1"].version = 2  # someone else already saved
    inc = _update_row({"id": "1", "name": "Row change", "version": 1})
    assert len(inc.fragments) == 1
    assert inc.fragments[0].action == "Add"
    j = render(inc)
    assert '"headerTitle": "Modificado por otro usuario"' in j
    assert (
        "Esta fila ha cambiado mientras la editabas. Recarga para ver los cambios o sobrescribe"
        " con tu versión." in j
    )
    # Recargar re-runs the search; Sobrescribir re-sends update-row with the SAME edited row.
    assert '"label": "Recargar", "actionId": "search"' in j
    assert '"label": "Sobrescribir", "actionId": "update-row"' in j
    assert (
        '"parameters": {"_forceOverwrite": true, "_editedRow": '
        '{"id": "1", "name": "Row change", "version": 1}}'
    ) in j
    # nothing was persisted
    assert _ARTICLES["1"].name == "Original"
    assert _ARTICLES["1"].version == 2


def test_overwriting_an_inline_row_edit_adopts_and_bumps_the_stored_version():
    _seed()
    _ARTICLES["1"].version = 2
    inc = _update_row(
        {"id": "1", "name": "Row change", "version": 1}, parameters={"_forceOverwrite": True}
    )
    assert "Modificado por otro usuario" not in render(inc)
    assert _ARTICLES["1"].name == "Row change"
    assert _ARTICLES["1"].version == 3
