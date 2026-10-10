"""Page decorations: banners, badges, KPIs, peer navigation, timestamp, FABs, events (Java's PageMetadataExtractor)."""

from __future__ import annotations

from typing import Any

from mateu_dtos import (
    Badge,
    Banner,
    CustomTrigger,
    Fab,
    Kpi,
    PeerNav,
)
from mateu_uidl import (
    HeaderBadge,
    kpi as KpiMarker,
    PeerNavigationSupplier,
    Timestamp,
)

from ..naming import camel_case
from ..reflection import (
    methods_with,
    view_fields,
)
from ._base import MixinBase


class DecorationMapperMixin(MixinBase):
    # ── Decorations ────────────────────────────────────────────────────────────
    def banners(self, cls, instance) -> list[Banner]:
        out = []
        for name, fn in methods_with(cls, "__mateu_banner__"):
            a = getattr(fn, "__mateu_banner__")
            ret = getattr(instance, name)()
            desc = ret if isinstance(ret, str) else None
            # Java's declarative @Banner does not emit hasIcon (the DTO default is True, but the
            # reference omits it → false to the renderer); match that so the wire is identical.
            out.append(Banner(theme=a.theme.value, title=a.title, description=desc, has_icon=False))
        return out

    def badges(self, cls, instance) -> list[Badge]:
        out = []
        for f in view_fields(cls):
            hb = f.marker(HeaderBadge)
            if hb is None:
                continue
            value = getattr(instance, f.name, None)
            text = None if value is None else str(value)
            if not text or not text.strip():
                continue
            out.append(Badge(text=text, color=hb.color))
        return out

    def kpis(self, cls, instance) -> list[Kpi]:
        out = []
        # Method KPIs (@kpi on a method): the method's return value is the KPI text.
        for name, fn in methods_with(cls, "__mateu_kpi__"):
            title = getattr(fn, "__mateu_kpi__")
            value = getattr(instance, name)()
            out.append(Kpi(title=title, text="" if value is None else str(value)))
        # Field KPIs (kpi() as a field marker): the field's value is the KPI text; the field is
        # hoisted out of the form body (see visible()).
        for f in view_fields(cls):
            marker = f.marker(KpiMarker)
            if marker is None:
                continue
            value = getattr(instance, f.name, None)
            out.append(Kpi(title=marker.title, text="" if value is None else str(value)))
        return out

    def peer_nav(self, instance) -> "PeerNav | None":
        """Previous/next peer-object arrows (the Redwood "next/previous object" header element)
        from a ``PeerNavigationSupplier``; None when the page supplies none."""
        if not isinstance(instance, PeerNavigationSupplier):
            return None
        p = instance.peers()
        if p is None:
            return None
        return PeerNav(
            prev_label=p.prev_label,
            prev_route=p.prev_route,
            next_label=p.next_label,
            next_route=p.next_route,
        )

    def timestamp_of(self, cls, instance) -> str | None:
        """The page's "last updated" timestamp from the first ``Timestamp()`` field (an optional
        label prefix + the value's str()); None when there is no such field or its value is None."""
        for f in view_fields(cls):
            marker = f.marker(Timestamp)
            if marker is None:
                continue
            value = getattr(instance, f.name, None)
            if value is None:
                return None
            return str(value) if not marker.label else f"{marker.label} {value}"
        return None

    def fabs(self, cls) -> list[Fab]:
        out = []
        for name, fn in methods_with(cls, "__mateu_fab__"):
            a = getattr(fn, "__mateu_fab__")
            out.append(Fab(icon=a.icon, action_id=camel_case(name), label=a.label, order=a.order))
        out.sort(key=lambda f: f.order)
        return out

    def events_of(self, cls) -> tuple[list[Any], str | None]:
        triggers = [
            CustomTrigger(event=e, action_id=a)
            for (e, a) in getattr(cls, "__mateu_subscriptions__", ())
        ]
        return triggers, getattr(cls, "__mateu_emits__", None)
