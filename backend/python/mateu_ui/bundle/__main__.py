"""``python -m mateu_ui.bundle`` — exports a Mateu app to a STATIC BUNDLE (the Python twin of
``mvn mateu-bundle:bundle``).

    python -m mateu_ui.bundle my_app.views [more.modules | pkg.mod:ViewClass …] \\
        --ui path/to/mateu-vaadin.jar --out dist [--specs specs/ui] [--base-url /app] \\
        [--title "My app"] [--static] [--specs-only] [--include-param-routes] \\
        [--environment prod] [--mock] [--route /a --route /b] [--no-pwa] \\
        [--fail-on-empty] [--fail-on-skipped]

The sources are what ``add_mateu(app, …)`` takes: modules (or ``module:Class``) holding the
``@ui``/``@app`` classes and catalogue suppliers. A YAML-only app passes none and points
``--specs`` at its ``specs/ui``. Every route is rendered IN PROCESS through this port's own
``SyncHandler`` — no server is started.

Exit status: 0 = bundle written; 1 = ``--static`` and something still needs a server (the report is
printed), or ``--fail-on-empty`` / ``--fail-on-skipped``; 2 = bad arguments.
"""

from __future__ import annotations

import argparse
import importlib
import logging
import os
import sys
from pathlib import Path


def _load_source(spec: str):
    module_name, _, attr = spec.partition(":")
    module = importlib.import_module(module_name)
    if not attr:
        return module
    obj = module
    for part in attr.split("."):
        obj = getattr(obj, part)
    return obj


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="python -m mateu_ui.bundle",
        description="Export a Mateu app (code and/or YAML) to a static bundle a CDN can serve.",
    )
    p.add_argument("sources", nargs="*", help="modules (or module:Class) with the @ui/@app classes")
    p.add_argument("--out", default="mateu-bundle", help="output directory (default: mateu-bundle)")
    p.add_argument(
        "--ui",
        default=os.environ.get("MATEU_UI"),
        help="the renderer: io.mateu:mateu-vaadin's jar or its static/ folder (default: MATEU_UI)",
    )
    p.add_argument("--specs", default=None, help="the specs/ui directory (default: MATEU_SPECS_DIR or ./specs/ui)")
    p.add_argument("--base-url", default="", help='the path the bundle is served under ("" = a host root)')
    p.add_argument("--title", default="Mateu", help="the page title")
    p.add_argument("--static", action="store_true", dest="static_only",
                   help="the bundle must run with NO backend: fail when anything needs a server")
    p.add_argument("--specs-only", action="store_true",
                   help="ship browser-expandable definition-only routes RAW (expanded in the browser)")
    p.add_argument("--include-param-routes", action="store_true",
                   help="bundle :param routes as templates (default: skipped)")
    p.add_argument("--environment", default=None, help="the type: Environment the REST sources point at")
    p.add_argument("--mock", action="store_true", help="ship the sources' sample data and answer from it")
    p.add_argument("--route", action="append", dest="routes", default=None,
                   help="export exactly these routes (repeatable)")
    p.add_argument("--no-pwa", action="store_true", help="do not ship the bundle as an installable app")
    p.add_argument("--fail-on-empty", action="store_true", help="fail when no route rendered")
    p.add_argument("--fail-on-skipped", action="store_true", help="fail when any route could not be bundled")
    p.add_argument("-q", "--quiet", action="store_true", help="only report what went wrong")
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(level=logging.WARNING if args.quiet else logging.INFO, format="%(message)s")
    log = logging.getLogger("mateu.bundle")
    if not args.ui:
        print("mateu-bundle: no renderer. Pass --ui <io.mateu:mateu-vaadin jar or its static/ folder>"
              " (or set MATEU_UI).", file=sys.stderr)
        return 2
    if args.specs:
        os.environ["MATEU_SPECS_DIR"] = str(Path(args.specs).resolve())
    if args.environment:
        os.environ["MATEU_ENVIRONMENT"] = args.environment
    sys.path.insert(0, os.getcwd())
    from mateu_ui.core import MateuRegistry, SyncHandler
    from mateu_ui.core.ui_page import RendererFiles

    from . import BundleExporter
    from . import writer

    try:
        renderer = RendererFiles.at(args.ui)
    except FileNotFoundError as missing:
        print(f"mateu-bundle: {missing}", file=sys.stderr)
        return 2
    sources = [_load_source(s) for s in args.sources]
    registry = MateuRegistry(*sources)
    handler = SyncHandler(registry, environment=args.environment)
    exporter = BundleExporter(handler)
    if args.routes:
        manifest = exporter.export(args.base_url, args.routes)
    else:
        manifest = exporter.export_all(
            args.base_url,
            static_only=True,
            include_param_routes=args.include_param_routes,
            specs_only=args.specs_only,
            mock=args.mock,
            environment=args.environment,
        )
    out = writer.write(
        args.out, manifest, renderer, args.base_url, args.title, not args.no_pwa, registry.app_type
    )
    ok = sum(1 for e in manifest.entries if e.ok)
    for e in manifest.entries:
        if not e.ok:
            log.warning("mateu-bundle: skipped %s — %s", e.route, e.skip_reason)
    log.info("mateu-bundle: %s/%s route(s) rendered → %s", ok, len(manifest.entries), out)
    if args.specs_only and manifest.definitions:
        log.info("mateu-bundle: specs mode — %s raw definition(s) shipped for the browser to expand",
                 len(manifest.definitions))
    if args.fail_on_empty and ok == 0:
        print("mateu-bundle: no routes rendered", file=sys.stderr)
        return 1
    if args.static_only:
        violations = exporter.static_safety(manifest)
        if violations:
            detail = "\n".join(f"  {v}" for v in violations)
            print(
                f"mateu-bundle: the bundle is declared static (--static) but {len(violations)} thing(s)"
                f" still need a server:\n{detail}\nMake each one client-side (a restAction / @rest_action,"
                " a rowsSource / @rest_listing, a direct source with no secret), or drop --static to"
                " deploy the bundle in front of a backend.",
                file=sys.stderr,
            )
            return 1
        log.info("mateu-bundle: static-safety report clean — no route needs a server")
    skipped = [e for e in manifest.entries if not e.ok]
    if args.fail_on_skipped and skipped:
        detail = "\n".join(f"  {e.route} — {e.skip_reason}" for e in skipped)
        print(f"mateu-bundle: {len(skipped)} route(s) could not be bundled (--fail-on-skipped):\n{detail}",
              file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
