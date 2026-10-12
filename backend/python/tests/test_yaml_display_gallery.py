"""The YAML display gallery (the Java golden source, backend/shared/core/src/test/resources/specs/ui/
display-gallery.yaml) built by the Python YAML loader: every display component the Python fluent API
has must reach the wire as itself — it used to render "Unsupported component: <type>" for all but
layouts, fields, buttons and texts."""

import json
from pathlib import Path

from mateu_core.mapper import ReflectionMapper
from mateu_core.yaml_preview import build_from_yaml

GALLERY = (
    Path(__file__).resolve().parents[2]
    / "shared/core/src/test/resources/specs/ui/display-gallery.yaml"
)
GOLDEN = (
    Path(__file__).resolve().parents[3]
    / "frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__/display-gallery.golden.json"
)


def types_of(node, out):
    if isinstance(node, dict):
        md = node.get("metadata")
        if isinstance(md, dict) and isinstance(md.get("type"), str):
            out.append(md["type"])
        for v in node.values():
            types_of(v, out)
    elif isinstance(node, list):
        for v in node:
            types_of(v, out)
    return out


def test_every_display_component_of_the_gallery_reaches_the_wire():
    tree = build_from_yaml(GALLERY.read_text())
    wire = ReflectionMapper().map_component(tree)
    mine = json.loads(wire.model_dump_json(by_alias=True))
    found = set(types_of(mine, []))
    unsupported = [
        n for n in json.dumps(mine).split('"text": "') if n.startswith("Unsupported component")
    ]
    golden = set(types_of(json.loads(GOLDEN.read_text())["fragments"][0]["component"], []))
    # what the Python fluent API does not have yet (tracked in design/walkthrough/pages.md)
    not_in_python = {"Markdown", "Image", "Badge", "Avatar", "AvatarGroup", "Chart", "Bpmn", "ProgressBar", "Card"}
    assert golden - not_in_python - found == set()
    assert len(unsupported) <= len(not_in_python)
