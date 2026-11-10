"""The project descriptor (``specs/ui/project.yaml``, ``type: Project``) against the renderer this
server actually SERVES — the Python mirror of Java's ``ProjectRendererCheck``.

The served renderer follows what ``add_mateu(ui=…)`` / ``MATEU_UI`` points at; the descriptor is
what the visual editor, Play and the static bundle paint with. When the two disagree, the app a
developer designed is not the app a user gets: one clear WARNING at startup, never a failure. A
server that serves no renderer (API only) has nothing to compare.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path

log = logging.getLogger("mateu.project")

#: The descriptor's conventional place (Java's ProjectSettings.CONVENTIONAL_PATH).
CONVENTIONAL_PATH = "specs/ui/project.yaml"
#: The renderers a project can name, with the artifact that serves each (Java's ProjectRenderer).
RENDERERS = {"vaadin": "io.mateu:mateu-vaadin", "redwood": "io.mateu:mateu-redwood"}
#: A file only the Redwood (Visual Builder) renderer ships (Java's REDWOOD_MARKER, minus static/).
REDWOOD_MARKER = "_redwood/app-flow.json"


def _specs_dir(specs_dir: str | os.PathLike[str] | None) -> Path:
    return Path(specs_dir or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")


def parse(text: str) -> str | None:
    """The renderer a descriptor's text declares (``vaadin`` when it names none or an unknown one,
    warned); None when the text is not a ``type: Project`` document."""
    import yaml

    try:
        root = yaml.safe_load(text)
    except Exception as e:  # noqa: BLE001 - an unreadable descriptor is reported, not fatal
        log.warning("Could not parse the project descriptor: %s", e)
        return None
    if not isinstance(root, dict) or root.get("type") != "Project":
        return None
    declared = root.get("renderer")
    if declared is None:
        return "vaadin"
    name = str(declared).strip().lower()
    if name not in RENDERERS:
        log.warning(
            "The project descriptor names an unknown renderer '%s' (expected one of %s); reading it"
            " as vaadin.", declared, list(RENDERERS),
        )
        return "vaadin"
    return name


def read(specs_dir: str | os.PathLike[str] | None = None) -> str | None:
    """The renderer the project declares: ``project.yaml``, else the first ``type: Project`` file
    under the specs directory. None when there is no descriptor (nothing was DECLARED)."""
    root = _specs_dir(specs_dir)
    conventional = root / "project.yaml"
    if conventional.is_file():
        found = parse(conventional.read_text(encoding="utf-8"))
        if found is not None:
            return found
    if not root.is_dir():
        return None
    descriptors = []
    for path in sorted(root.rglob("*.y*ml")):
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        if "Project" in text and parse(text) is not None:
            descriptors.append(path)
    if len(descriptors) > 1:
        log.warning(
            "More than one project descriptor (type: Project): %s — using the first. A project has"
            " one, at %s.", [str(d) for d in descriptors], CONVENTIONAL_PATH,
        )
    return parse(descriptors[0].read_text(encoding="utf-8")) if descriptors else None


def served(renderer_files) -> str | None:
    """The renderer the configured files serve (``ui_page.RendererFiles``), None when none is
    served (an API behind a separately deployed frontend)."""
    if renderer_files is None:
        return None
    return "redwood" if renderer_files.read(REDWOOD_MARKER) is not None else "vaadin"


def mismatch(declared: str | None, served_renderer: str | None) -> str | None:
    """The warning to log (Java's text), None when there is nothing to say: no descriptor, no
    renderer served, or both agree."""
    if declared is None or served_renderer is None or declared == served_renderer:
        return None
    return (
        f"The project descriptor ({CONVENTIONAL_PATH}) says renderer: {declared}, but this server"
        f" serves {served_renderer} ({RENDERERS[served_renderer]} is on the classpath). The served"
        " app follows the Maven dependency, so it will NOT look like what the visual editor, Play"
        f" and the static bundle show. Depend on {RENDERERS[declared]} instead of"
        f" {RENDERERS[served_renderer]}, or set renderer: {served_renderer} in the descriptor."
    )


def warn_on_startup(renderer_files, specs_dir: str | os.PathLike[str] | None = None) -> str | None:
    """Logs the mismatch WARNING, if any, and returns it. Never raises."""
    try:
        message = mismatch(read(specs_dir), served(renderer_files))
    except Exception as e:  # noqa: BLE001 - a check, never a failure
        log.debug("Project renderer check skipped: %s", e)
        return None
    if message:
        log.warning("%s", message)
    return message
