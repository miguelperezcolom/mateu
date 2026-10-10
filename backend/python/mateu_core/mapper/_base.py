"""The base every mixin of a split class inherits.

The class is composed from mixins (one module per concern), and a mixin's methods call methods
another mixin defines. At runtime that is just the MRO of the composed class; for the type checker
the mixin alone does not know them, so it is told that any other attribute exists.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any


class MixinBase:
    if TYPE_CHECKING:

        def __getattr__(self, name: str) -> Any: ...
