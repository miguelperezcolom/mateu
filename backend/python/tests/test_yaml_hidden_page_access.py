"""The YAML access keys survive the two situations where the personalised definition used to be
thrown away (the Python mirror of Java's YamlHiddenPageAccessSyncTest): the caller may see NOTHING
of the page (its root is hidden) → 403 before anything is hydrated or run; and personalising FAILS
(here: the translation pass raises) → the restrictions still apply, the text stays untranslated."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core import type_name  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.translations import TranslationRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import Identity, Message  # noqa: E402

MODULE = sys.modules[__name__]


class PayrollView:
    """The view model the YAML payroll routes bind: it pays whatever salary it is hydrated with."""

    salary: float = 100

    def pay(self) -> Message:
        return Message(f"paid {self.salary:g}")


VIEW = type_name(PayrollView)

FIELDS = """
    - {type: FormField, id: salary, label: "${i18n.salary}", dataType: number}
    - {type: Button, label: Pay, actionId: pay}
"""


def specs(tmp_path: Path) -> Path:
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        f"  - route: payroll\n    layout: payroll.yaml\n    viewModel: {VIEW}\n"
        f"  - route: payroll-bare\n    layout: payroll-bare.yaml\n    viewModel: {VIEW}\n"
        f"  - route: payroll-locked\n    layout: payroll-locked.yaml\n    viewModel: {VIEW}\n"
    )
    (tmp_path / "payroll.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  eyesOnly: admin\n  content:" + FIELDS
    )
    (tmp_path / "payroll-bare.yaml").write_text(
        "type: VerticalLayout\neyesOnly: admin\ncontent:"
        + FIELDS.replace("\n    - ", "\n  - ")
    )
    (tmp_path / "payroll-locked.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n"
        '    - {type: FormField, id: salary, label: "${i18n.salary}", dataType: number,'
        " readOnlyUnless: admin}\n"
        "    - {type: Button, label: Pay, actionId: pay}\n"
    )
    return tmp_path


class BrokenTranslations(TranslationRegistry):
    """A catalogue whose pass over a tree always fails."""

    def translate_tree(self, node, locale):
        raise RuntimeError("translation pass broke")


def handler(directory: Path, roles=(), broken=False) -> SyncHandler:
    h = SyncHandler(
        MateuRegistry(MODULE),
        identity_provider=lambda: Identity(roles=tuple(roles)),
    )
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(
        str(directory),
        h.routes,
        translations=BrokenTranslations(str(directory)) if broken else None,
    )
    return h


def pay(route: str) -> RunActionRq:
    return RunActionRq(
        route=route, action_id="pay", server_side_type=VIEW, component_state={"salary": 999}
    )


def paid(h: SyncHandler, route: str) -> str:
    return h.handle(pay(route)).messages[0].text


def test_a_caller_who_may_see_nothing_of_an_enveloped_page_is_refused(tmp_path):
    d = specs(tmp_path)
    with pytest.raises(MateuForbiddenException):
        handler(d).handle(pay("/payroll"))
    with pytest.raises(MateuForbiddenException):
        handler(d).handle(RunActionRq(route="/payroll"))
    assert paid(handler(d, roles=("admin",)), "/payroll") == "paid 999"


def test_a_caller_who_may_see_nothing_of_a_bare_layout_is_refused(tmp_path):
    d = specs(tmp_path)
    with pytest.raises(MateuForbiddenException):
        handler(d).handle(pay("/payroll-bare"))
    with pytest.raises(MateuForbiddenException):
        handler(d).handle(RunActionRq(route="/payroll-bare"))
    assert paid(handler(d, roles=("admin",)), "/payroll-bare") == "paid 999"


def test_a_broken_translation_pass_keeps_the_locked_fields_locked(tmp_path):
    d = specs(tmp_path)
    loader = YamlSpecLoader(str(d), RouteRegistry(str(d)), translations=BrokenTranslations(str(d)))
    assert "salary" in loader.load_spec_for("payroll-locked", lambda a: a is None, "en").locked_fields
    assert not loader.load_spec_for("payroll-locked", lambda a: True, "en").locked_fields
    assert paid(handler(d, broken=True), "/payroll-locked") == "paid 100"
    assert paid(handler(d, roles=("admin",), broken=True), "/payroll-locked") == "paid 999"


def test_a_broken_translation_pass_still_refuses_a_hidden_page(tmp_path):
    d = specs(tmp_path)
    with pytest.raises(MateuForbiddenException):
        handler(d, broken=True).handle(pay("/payroll"))
    assert paid(handler(d, roles=("admin",), broken=True), "/payroll") == "paid 999"
