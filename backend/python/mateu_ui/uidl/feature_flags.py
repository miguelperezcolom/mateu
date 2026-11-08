"""Feature flags — the hook behind the data-driven ``show`` of a tab (Java's ``FeatureFlags``)."""

from __future__ import annotations


class FeatureFlags:
    """Answers whether a feature flag is on. Subclass it among the sources handed to
    :class:`~mateu_ui.core.MateuRegistry` (instantiated with no arguments, like the other
    suppliers): ``show=`` on a ``routes.yaml`` child or a code-authored ``RouteEntry``, and
    ``Tab(show=…)`` on an in-page tab, offer the tab only while its flag is on.

    With no subclass, or none that knows the flag, the flag is ON: declaring a condition never hides
    a tab in an app that does not answer it. The Python mirror of Java's ``FeatureFlags`` and .NET's
    ``IFeatureFlags``."""

    def is_enabled(self, flag: str) -> bool | None:
        """Whether ``flag`` is on, or None when this supplier does not know it (the next one is
        asked)."""
        return None
