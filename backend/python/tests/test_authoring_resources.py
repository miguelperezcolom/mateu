"""The four authoring resources ship INSIDE the package as copies of ``backend/shared/uidl/`` — so a
wheel serves them with no repository around — and are pinned byte-equal to their sources here, so
the copies cannot drift (the Java jar, the .NET assembly and the sidecar serve the same bytes)."""

from __future__ import annotations

from pathlib import Path

import pytest

from mateu_ui.core.authoring import RESOURCES, by_uri, catalog, resources, specs_schema


def _uidl_dir() -> Path | None:
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "backend" / "shared" / "uidl"
        if (candidate / "specs-schema.json").is_file():
            return candidate
    return None


UIDL = _uidl_dir()


@pytest.mark.skipif(UIDL is None, reason="the repository's backend/shared/uidl is not present")
@pytest.mark.parametrize("resource", RESOURCES, ids=lambda r: r.file)
def test_each_packaged_copy_is_byte_equal_to_its_source(resource):
    assert UIDL is not None
    assert resources.data(resource.file) == (UIDL / resource.file).read_bytes(), (
        f"mateu_ui/core/authoring/resources/{resource.file} drifted from backend/shared/uidl/{resource.file}:"
        " copy it again"
    )


def test_the_resources_are_found_by_uri_and_parse():
    assert by_uri("mateu://guide").file == "authoring-guide.md"
    assert by_uri("mateu://nope") is None
    assert by_uri(None) is None
    assert "$defs" in specs_schema() and "Component" in specs_schema()["$defs"]
    assert catalog()["components"]
    assert resources.text("authoring-guide.md").strip()
