"""Page decorations: banners, badges, KPIs, peer navigation, timestamp, FABs, events (Java's PageMetadataExtractor)."""

from __future__ import annotations

from typing import Any

from mateu_dtos import (
    Badge,
    Banner,
    CustomTrigger,
    OnErrorTrigger,
    OnLoadTrigger,
    OnSuccessTrigger,
    OnValueChangeTrigger,
    Fab,
    Kpi,
    Option,
    PeerNav,
    RecordSwitcherRecord,
)
from mateu_uidl import (
    HeaderBadge,
    Label,
    TriggerType,
    kpi as KpiMarker,
    PeerNavigationSupplier,
    RecordSwitcherSupplier,
    Timestamp,
)

from ..naming import camel_case, humanize
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
            if f.type is bool:
                # Java's @BadgeInHeader on a boolean: the label while true, no chip while false
                text = (
                    (hb.label or (f.marker(Label).value if f.has(Label) else humanize(f.name)))
                    if value is True
                    else None
                )
            else:
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

    def record_switcher(self, instance) -> "RecordSwitcherRecord | None":
        """The header's record/context switcher (the Redwood selectObject/selectContext element)
        from a ``RecordSwitcherSupplier``; None when the page supplies none (mirrors Java's
        PageMapper.mapSwitcher)."""
        if not isinstance(instance, RecordSwitcherSupplier):
            return None
        sw = instance.switcher()
        if sw is None:
            return None
        sw_type = getattr(sw.type, "value", sw.type) or "object"
        return RecordSwitcherRecord(
            options=[self._switcher_option(o) for o in sw.options],
            value=None if sw.value is None else str(sw.value),
            type=str(sw_type),
            label=self._opt_t(sw.label),
            searchable=bool(sw.searchable),
            disabled=bool(sw.disabled),
            action_id=RecordSwitcherSupplier.ACTION_ID,
        )

    @staticmethod
    def _switcher_option(o) -> Option:
        """A switcher entry: a ``(value, label)`` pair, an ``Option`` or anything with
        ``value``/``label`` (attributes or dict keys)."""
        if isinstance(o, Option):
            return o
        if isinstance(o, (tuple, list)):
            value = o[0]
            label = o[1] if len(o) > 1 else o[0]
        elif isinstance(o, dict):
            value, label = o.get("value"), o.get("label", o.get("value"))
        else:
            value = getattr(o, "value", o)
            label = getattr(o, "label", value)
        return Option(value=str(value), label=str(label))

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
            # an @eyes_only action the caller may not run is refused on invocation and not
            # advertised either (Java's Authorizer.isVisible)
            if not self.authorized(getattr(fn, "__mateu_eyes_only__", None)):
                continue
            a = getattr(fn, "__mateu_fab__")
            out.append(Fab(icon=a.icon, action_id=camel_case(name), label=a.label, order=a.order))
        out.sort(key=lambda f: f.order)
        return out

    def events_of(self, cls) -> tuple[list[Any], str | None]:
        # @trigger()s first, then @subscribe_to()s — Java's TriggerMapper.createTriggers order
        triggers: list[Any] = [_trigger_wire(t) for t in getattr(cls, "__mateu_triggers__", ())]
        options = getattr(cls, "__mateu_subscription_options__", {})
        for e, a in getattr(cls, "__mateu_subscriptions__", ()):
            source, from_, condition = options.get((e, a), ("DOCUMENT", "", ""))
            triggers.append(
                # the action id is the camelCase of the method name, as for every other action id
                CustomTrigger(
                    event=e, action_id=camel_case(a), source=source,
                    from_=from_ or None, condition=condition or None,
                )
            )
        return triggers, getattr(cls, "__mateu_emits__", None)


def triggered_action_ids(cls) -> list[str]:
    """The action ids a view's own triggers name: each @trigger's action, the action an
    on_success / on_error trigger follows, and each @subscribe_to's action (Java's
    ActionMapper.triggeredActions)."""
    ids: list[str] = []
    for t in getattr(cls, "__mateu_triggers__", ()):
        ids.append(camel_case(t.action))
        if t.type in (TriggerType.on_success, TriggerType.on_error) and t.called_action:
            ids.append(camel_case(t.called_action))
    ids.extend(camel_case(a) for _e, a in getattr(cls, "__mateu_subscriptions__", ()) if a)
    return [i for i in dict.fromkeys(ids) if i]


def _trigger_wire(t) -> Any:
    """A @trigger declaration as its wire DTO (mirrors Java's TriggerMapper.mapToTrigger: a raw
    on_custom_event trigger listens on the component itself, SELF)."""
    action_id = camel_case(t.action)
    called = camel_case(t.called_action) if t.called_action else t.called_action
    if t.type is TriggerType.on_success:
        return OnSuccessTrigger(
            action_id=action_id, called_action_id=called, condition=t.condition,
            timeout_millis=t.timeout_millis, background=t.background,
        )
    if t.type is TriggerType.on_error:
        return OnErrorTrigger(action_id=action_id, called_action_id=called, condition=t.condition)
    if t.type is TriggerType.on_value_change:
        return OnValueChangeTrigger(action_id=action_id, property_name=t.property_name, condition=t.condition)
    if t.type is TriggerType.on_custom_event:
        return CustomTrigger(
            event=t.event_name, action_id=action_id, source="SELF", condition=t.condition or None
        )
    return OnLoadTrigger(
        action_id=action_id, timeout_millis=t.timeout_millis, times=t.times,
        condition=t.condition, background=t.background,
    )
