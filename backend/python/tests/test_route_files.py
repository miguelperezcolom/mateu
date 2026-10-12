"""Every authored route file, not only ``routes.yaml`` — the Python mirror of Java's discovery: the
files a ``type: UI`` mount lists (relative to the mount) and any ``type: Routes`` file no mount
lists (relative to its own ``basePath`` header). Found walking the YAML fixtures on the Python port:
routes in ``sample1-routes.yaml`` answered "Route not found"."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core.route_registry import RouteRegistry  # noqa: E402


def test_route_files_listed_by_a_mount_and_standalone_type_routes_files_are_read(tmp_path):
    (tmp_path / "shop.ui.yaml").write_text("type: UI\nbasePath: /shop\nroutes: [shop-routes.yaml, more.yaml]\n")
    (tmp_path / "shop-routes.yaml").write_text("type: Routes\nroutes:\n  - {route: orders, layout: orders.yaml}\n")
    (tmp_path / "more.yaml").write_text("routes:\n  - {route: customers, layout: customers.yaml}\n")
    (tmp_path / "routes.yaml").write_text("routes:\n  - {route: about, layout: about.yaml}\n")
    (tmp_path / "back-office.yaml").write_text(
        "type: Routes\nbasePath: /back\nroutes:\n  - {route: users, layout: users.yaml}\n"
    )
    (tmp_path / "orders.yaml").write_text("type: Text\ntext: not a route file\n")

    registry = RouteRegistry(str(tmp_path))

    def definition(path):
        m = registry.match(path)
        return m.entry.definition if m else None

    assert definition("shop/orders") == "orders.yaml"
    assert definition("shop/customers") == "customers.yaml"
    assert definition("about") == "about.yaml"
    assert definition("back/users") == "users.yaml"
