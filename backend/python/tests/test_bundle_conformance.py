"""The Python half of the BUNDLE conformance corpus (``conformance/bundle/README.md``): each case is
a ``specs/ui`` directory every backend reads as it is, and ``manifest.json`` (pre-rendered) /
``manifest-specs-only.json`` (specs mode) are the normalised manifests Java's exporter writes for it
— frozen goldens this port's exporter must reproduce."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from mateu_ui.bundle import BundleExporter
from mateu_ui.core import MateuRegistry, SyncHandler

from .test_wire_conformance import normalise

CORPUS = Path(__file__).resolve().parents[3] / "conformance" / "bundle"
CASES = ["yaml-shell"]


def normalised_manifest(raw: dict) -> dict:
    """Mirrors Java's BundleConformanceTest.normalisedManifest: each entry's wire parsed and
    normalised like the wire corpus, the build time dropped, the entries sorted by route."""
    copy = json.loads(json.dumps(raw))
    copy.pop("generatedAt", None)
    entries = []
    for entry in sorted(copy.get("entries") or [], key=lambda e: e.get("route") or ""):
        for key in ("json", "contentJson"):
            if entry.get(key) is not None:
                entry[key] = json.loads(entry[key])
        entries.append(entry)
    copy["entries"] = entries
    return normalise(copy)


def export(case: str, monkeypatch, specs_only: bool) -> dict:
    specs = CORPUS / case / "specs" / "ui"
    monkeypatch.setenv("MATEU_SPECS_DIR", str(specs))
    handler = SyncHandler(MateuRegistry())
    exporter = BundleExporter(handler, specs)
    manifest = exporter.export_all("", static_only=True, include_param_routes=True, specs_only=specs_only)
    return json.loads(manifest.to_json())


@pytest.mark.parametrize("case", CASES)
def test_python_writes_the_mobile_manifest_like_the_reference(case, monkeypatch):
    """The bundle's ``mateu/v3/manifest`` — what the exporter's writer puts on disk for a YAML-only
    app (no ``@app`` class): the root mount's app shell presents it. ``mateuVersion`` is dropped,
    as in Java's golden (it is the running build's)."""
    from mateu_ui.bundle import writer
    from mateu_ui.core import yaml_app_shell

    specs = CORPUS / case / "specs" / "ui"
    monkeypatch.setenv("MATEU_SPECS_DIR", str(specs))
    handler = SyncHandler(MateuRegistry())
    shell = yaml_app_shell.mount_shell(handler, "")
    mine = json.loads(writer.mobile_manifest_json(None, "Page title", shell))
    mine.pop("mateuVersion", None)
    golden = CORPUS / case / "mobile-manifest.json"
    assert mine == json.loads(golden.read_text())


def test_every_bundle_case_is_wired():
    assert {d.name for d in CORPUS.iterdir() if d.is_dir()} == set(CASES)


@pytest.mark.parametrize("case", CASES)
@pytest.mark.parametrize("specs_only", [False, True], ids=["pre-rendered", "specs-only"])
def test_python_bundles_like_the_reference(case, specs_only, monkeypatch):
    golden = CORPUS / case / ("manifest-specs-only.json" if specs_only else "manifest.json")
    mine = normalised_manifest(export(case, monkeypatch, specs_only))
    theirs = json.loads(golden.read_text())
    assert mine == theirs, (
        f"'{case}': the Python bundle differs from the corpus ({golden}). Close the divergence in "
        "the port — never regenerate the golden to match a port."
    )
