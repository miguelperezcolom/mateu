"""A ``type: ContentSlot`` authored in YAML (Java's YamlUidlMapperFactory registers the record as a
type, keys = its components): read by the YAML builder into the fluent ``ContentSlot`` and resolved
by the host like the field marker / fluent one — with no content remote configured, the fallback
is painted, and a slot with no fallback is removed (never a failure)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.yaml_preview import build_from_yaml, parse_text_reporting  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import components as fluent  # noqa: E402

MODULE = sys.modules[__name__]

PAGE = """
layout:
  type: VerticalLayout
  content:
    - {type: Text, text: Home}
    - {type: ContentSlot, key: shop.home.banner, fallback: Welcome to the shop, timeoutMs: 300,
       description: The banner over the catalogue, degradeToClient: true, style: "width: 100%"}
    - {type: ContentSlot, key: shop.home.nothing}
"""


def test_the_yaml_keys_are_the_records_components():
    tree = build_from_yaml(PAGE)
    assert isinstance(tree, fluent.VerticalLayout)
    slot = tree.content[1]
    assert slot == fluent.ContentSlot(
        key="shop.home.banner",
        fallback="Welcome to the shop",
        timeout_ms=300,
        description="The banner over the catalogue",
        degrade_to_client=True,
        style="width: 100%",
    )
    assert parse_text_reporting(PAGE)[1] is None


def test_a_yaml_slot_with_no_content_remote_paints_its_fallback(tmp_path):
    (tmp_path / "home.yaml").write_text(PAGE)
    h = SyncHandler(MateuRegistry(MODULE))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    text = str(h.handle(RunActionRq(route="home")).model_dump(by_alias=True, mode="json"))
    assert "Welcome to the shop" in text
    assert "MicroFrontend" not in text and "slot_shop_home_nothing" not in text
