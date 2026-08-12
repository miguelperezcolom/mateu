"""Partials — the Python mirror of Java's ``PartialExpansionTest`` and .NET's ``PartialTests``.

A partial is a page-shaped thing with no page: one component, or a list of them, usable anywhere a
component is. The property that decides whether that sentence is true is that a partial standing for
several components **splices** into its parent rather than wrapping — otherwise "anywhere a
component is" quietly excludes forms and grids, the places reuse matters most.

As in Java, partials are resolved while the tree is built and never reach the wire, so no renderer
has to learn the concept.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

HERE = Path(__file__).resolve().parent / "specs" / "ui"

from mateu_core.partial_registry import PartialRegistry  # noqa: E402
from mateu_core.yaml_preview import build_from_yaml  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402


def partials() -> PartialRegistry:
    return PartialRegistry(str(HERE))


def describe(component) -> str:
    for attribute in ("field_id", "text"):
        value = getattr(component, attribute, None)
        if value:
            return value
    return type(component).__name__


def test_a_multi_component_partial_splices_into_its_parent_instead_of_nesting():
    # THE test. In a form, a wrapper would put two fields in one grid cell.
    layout = YamlSpecLoader(str(HERE)).load_spec("partial-page").layout

    assert [describe(c) for c in layout.content] == [
        "name",
        "street",
        "city",
        "Prices include VAT.",
    ]


def test_a_partial_file_that_is_just_a_component_needs_no_envelope():
    tree = build_from_yaml(
        "type: VerticalLayout\ncontent:\n  - type: Partial\n    ref: legal-notice\n", partials()
    )

    assert [describe(c) for c in tree.content] == ["Prices include VAT."]


def test_a_missing_ref_costs_the_partial_and_not_the_page():
    # A typo in one ref must not take down every page that mentions it.
    tree = build_from_yaml(
        "type: VerticalLayout\ncontent:\n  - type: Text\n    text: still here\n"
        "  - type: Partial\n    ref: no-such-thing\n",
        partials(),
    )

    assert [describe(c) for c in tree.content] == ["still here"]


def test_a_partial_cycle_is_dropped_rather_than_recursing_forever():
    tree = build_from_yaml(
        "type: VerticalLayout\ncontent:\n  - type: Partial\n    ref: loop-a\n", partials()
    )

    assert tree.content == ()


def test_a_partial_can_be_registered_in_code_and_wins_over_a_file_of_the_same_name():
    registry = partials()
    registry.register("legal-notice", [{"type": "Text", "text": "Registered in code."}])

    tree = build_from_yaml(
        "type: VerticalLayout\ncontent:\n  - type: Partial\n    ref: legal-notice\n", registry
    )

    assert [describe(c) for c in tree.content] == ["Registered in code."]


def test_a_layout_delta_page_is_declined_rather_than_rendered_as_garbage():
    # `layoutDelta:` is Java-only today. What matters here is that the port does not render the
    # envelope itself as a component — a visibly wrong page is worse than no page.
    from mateu_core.yaml_preview import parse_spec

    model_view, layout = parse_spec("modelView: com.acme.Contact\nlayoutDelta:\n  order: [b, a]\n")

    assert model_view == "com.acme.Contact"
    assert layout is None
