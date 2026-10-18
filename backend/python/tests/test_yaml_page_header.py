"""The page-header keys on a YAML ``type: Form`` node (overline, titlePlaceholder, timestamp,
badges, kpis, peerNav, recordSwitcher, banners, fabs) reach the "Form" wire metadata with the
PageDto field names — the Python mirror of Java's YAML header parity (and of the .NET
YamlPageHeaderTests)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.yaml_preview import build_from_yaml  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402

MODULE = sys.modules[__name__]

FULL = """
layout:
  type: Form
  title: ${state.name}
  overline: Customers
  titlePlaceholder: New customer…
  timestamp: Last updated ${state.updatedAt}
  badges:
    - { label: "${state.status}", color: success }
    - { label: VIP }
  kpis:
    - { label: Balance, value: "${state.balance}" }
  peerNav: { prevLabel: Previous, prevRoute: customers/1, nextLabel: Next, nextRoute: customers/3 }
  recordSwitcher:
    label: Customer
    value: ${state.id}
    options:
      - { value: "1", label: Ada }
      - { value: "2", label: Grace }
    route: customers/${state._record}
  banners:
    - { theme: WARNING, title: Overdue, description: "Two invoices are overdue", closeable: true, timeoutSeconds: 5 }
  fabs:
    - { icon: "vaadin:plus", label: New order, actionId: newOrder, order: 2 }
    - { icon: "vaadin:phone", label: Call, actionId: call, order: 1, buttonStyle: secondary }
    - { icon: "vaadin:envelope", label: Mail, actionId: mail, order: 2 }
  content:
    - type: Text
      text: Hello
"""

PLAIN = """
layout:
  type: Form
  title: Plain
  content:
    - type: Text
      text: Hello
"""

SWITCHER = """
layout:
  type: Form
  title: Switching
  recordSwitcher:
    optionsSource: { ref: people, itemsPath: content, valuePath: id, labelPath: name }
  content:
    - type: Text
      text: Hello
"""


def _find_form(node):
    if isinstance(node, dict):
        meta = node.get("metadata")
        if isinstance(meta, dict) and meta.get("type") == "Form":
            return meta
        for v in node.values():
            hit = _find_form(v)
            if hit is not None:
                return hit
    elif isinstance(node, list):
        for v in node:
            hit = _find_form(v)
            if hit is not None:
                return hit
    return None


def form_of(tmp_path, route: str, yaml_text: str) -> dict:
    (tmp_path / f"{route}.yaml").write_text(yaml_text)
    h = SyncHandler(MateuRegistry(MODULE))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    inc = h.handle(RunActionRq(route=route))
    component = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    form = _find_form(component)
    assert form is not None, component
    return form


def test_every_header_key_reaches_the_wire(tmp_path):
    form = form_of(tmp_path, "customer", FULL)
    assert form["title"] == "${state.name}"
    assert form["overline"] == "Customers"
    assert form["titlePlaceholder"] == "New customer…"
    assert form["timestamp"] == "Last updated ${state.updatedAt}"

    badges = form["badges"]
    assert [b["text"] for b in badges] == ["${state.status}", "VIP"]
    assert [b["color"] for b in badges] == ["success", "normal"]
    assert badges[0]["pill"] is False
    assert badges[0]["primary"] is False
    assert badges[0]["small"] is False

    assert form["kpis"] == [
        {"type": "KPIDto", "title": "Balance", "text": "${state.balance}", "icon": None, "color": None}
    ]
    assert form["peerNav"] == {
        "prevLabel": "Previous",
        "prevRoute": "customers/1",
        "nextLabel": "Next",
        "nextRoute": "customers/3",
    }

    sw = form["switcher"]
    assert sw["label"] == "Customer"
    assert sw["value"] == "${state.id}"
    assert sw["type"] == "object"
    assert sw["actionId"] == "_switchRecord"
    assert sw["route"] == "customers/${state._record}"
    assert sw["optionsSource"] is None
    assert [(o["value"], o["label"]) for o in sw["options"]] == [("1", "Ada"), ("2", "Grace")]

    (banner,) = form["banners"]
    assert banner["theme"] == "WARNING"
    assert banner["title"] == "Overdue"
    assert banner["description"] == "Two invoices are overdue"
    assert banner["hasIcon"] is False
    assert banner["hasCloseButton"] is True
    assert banner["timeoutSeconds"] == 5


def test_fabs_are_sorted_by_order_and_default_to_primary(tmp_path):
    fabs = form_of(tmp_path, "customer", FULL)["fabs"]
    # order 1 first; the two order-2 FABs keep their declaration order (stable)
    assert [f["actionId"] for f in fabs] == ["call", "newOrder", "mail"]
    assert [f["id"] for f in fabs] == ["call", "newOrder", "mail"]
    assert fabs[0]["buttonStyle"] == "secondary"
    assert fabs[1]["buttonStyle"] == "primary"
    assert fabs[1]["label"] == "New order"
    assert fabs[1]["icon"] == "vaadin:plus"


def test_absent_header_keys_emit_nothing(tmp_path):
    form = form_of(tmp_path, "plain", PLAIN)
    assert form["title"] == "Plain"
    for key in ("overline", "titlePlaceholder", "timestamp", "peerNav", "switcher"):
        assert form[key] is None
    for key in ("badges", "kpis", "banners", "fabs"):
        assert form[key] == []


def test_a_switcher_defaults_to_an_object_switcher_dispatching_switch_record(tmp_path):
    sw = form_of(tmp_path, "switching", SWITCHER)["switcher"]
    assert sw["type"] == "object"
    assert sw["actionId"] == "_switchRecord"
    assert sw["route"] is None
    assert sw["options"] == []
    source = sw["optionsSource"]
    assert source["ref"] == "people"
    assert source["itemsPath"] == "content"
    assert source["valuePath"] == "id"
    assert source["labelPath"] == "name"


def test_the_form_content_travels_as_its_children():
    from mateu_ui.uidl import components as fluent

    built = build_from_yaml("type: Form\ntitle: T\ncontent:\n  - type: Text\n    text: Hi\n")
    assert isinstance(built, fluent.Form)
    assert len(built.content) == 1
