"""Mateu for Python, distributed on PyPI as ``mateu-ui``.

Everything lives under this one namespace so the wheel installs a single top-level package:

- :mod:`mateu_ui.uidl` — the authoring API (``@ui``, ``@title``, ``Annotated`` field modifiers, …)
- :mod:`mateu_ui.dtos` — the wire model exchanged with the renderers
- :mod:`mateu_ui.core` — the engine (registry, reflection mapper, the sync use case)
- :mod:`mateu_ui.fastapi` — the FastAPI adapter

Importing this package is cheap: the subpackages are loaded only when imported.
"""

from ._version import __version__

__all__ = ["__version__"]
