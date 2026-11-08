"""A small CODE app exported as a static bundle (``python -m mateu_ui.bundle``): an app shell with
two pages, no backend needed once exported.

    cd backend/python
    python -m mateu_ui.bundle samples.static_bundle.views \\
        --ui ../shared/frontend/vaadin-lit/src/main/resources/static --out /tmp/py-bundle --static
    python -m http.server 8000 --directory /tmp/py-bundle
"""

from __future__ import annotations

from mateu_ui.uidl import app, menu_item, subtitle, title, ui


@ui("/hello")
@title("Hello from a static bundle")
@subtitle("Pre-rendered by the Python exporter")
class Hello:
    greeting: str = "No server answered this page"


@ui("/about")
@title("About")
class About:
    what: str = "A Mateu UI exported by python -m mateu_ui.bundle"


@app("Python static bundle")
class StaticBundleApp:
    @menu_item("Hello")
    def hello(self) -> Hello:
        return Hello()

    @menu_item("About")
    def about(self) -> About:
        return About()


__all__ = ["About", "Hello", "StaticBundleApp"]
