"""``layoutDelta:`` — what a human changed about a screen's INFERRED layout, re-applied on every
request (the Python port of Java's ``LayoutDelta`` + ``LayoutDeltaApplier``).

A ``layout:`` is a snapshot: it takes the screen out of inference for good. A delta records the
DECISIONS — this field first, that one hidden, this one relabelled or wider — anchored to field ids,
so a field the model grows later still appears in its inferred place, and one it loses is an entry
that simply matches nothing::

    viewModel: shop.Contact
    layoutDelta:
      order: [email, name]
      hidden: [internalNote]
      overrides:
        name: { label: "Full name", colspan: 2 }

Against an inferred tree (fields spread over sections, tabs, rows): ``hidden`` removes the field
wherever it sits, ``overrides`` apply wherever it sits, ``order`` reorders the fields WITHIN each
container that holds them, leaving non-field siblings in their slots. A delta never moves a field
between containers nor restructures the tree — the limit that keeps it a delta.
"""

from __future__ import annotations

import logging
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel

from mateu_dtos import ClientSideComponent, FormFieldMetadata

log = logging.getLogger("mateu.layout_delta")


@dataclass(frozen=True)
class FieldOverride:
    label: str | None = None
    colspan: int | None = None
    section: str | None = None


@dataclass(frozen=True)
class LayoutDelta:
    order: tuple[str, ...] = ()
    hidden: tuple[str, ...] = ()
    overrides: dict[str, FieldOverride] = field(default_factory=dict)

    def is_empty(self) -> bool:
        return not self.order and not self.hidden and not self.overrides

    @staticmethod
    def parse(node: Any) -> "LayoutDelta":
        """A ``layoutDelta:`` YAML node (``{}`` / None → the empty delta)."""
        if not isinstance(node, dict):
            return LayoutDelta()
        overrides: dict[str, FieldOverride] = {}
        raw = node.get("overrides")
        if isinstance(raw, dict):
            for fid, o in raw.items():
                if isinstance(o, dict):
                    colspan = o.get("colspan")
                    overrides[str(fid)] = FieldOverride(
                        label=None if o.get("label") is None else str(o.get("label")),
                        colspan=int(colspan) if isinstance(colspan, (int, str)) and str(colspan).isdigit() else None,
                        section=None if o.get("section") is None else str(o.get("section")),
                    )
        return LayoutDelta(
            order=tuple(str(x) for x in node.get("order") or [] if x is not None),
            hidden=tuple(str(x) for x in node.get("hidden") or [] if x is not None),
            overrides=overrides,
        )

    def apply_to(self, inferred: list[str]) -> list[str]:
        """The field ids to render, in order: the listed ones first as the human chose, then the
        rest in their inferred order; hidden and stale entries dropped."""
        out = [i for i in self.order if i in inferred and i not in self.hidden]
        out = list(dict.fromkeys(out))
        out += [i for i in inferred if i not in self.hidden and i not in out]
        return out


def _field_id(node: Any) -> str | None:
    if isinstance(node, ClientSideComponent) and isinstance(node.metadata, FormFieldMetadata):
        return node.metadata.field_id
    return None


def apply(tree: Any, delta: LayoutDelta | None) -> Any:
    """``tree`` (a wire component, or a list of them) with the delta applied; the same object when
    the delta is empty. Never raises: a page rendering its inferred layout beats one that does not
    render."""
    if tree is None or delta is None or delta.is_empty():
        return tree
    try:
        return _rewrite(tree, delta)
    except Exception as e:  # noqa: BLE001
        log.error("Could not apply the layout delta; rendering the inferred layout (%s)", e)
        return tree


def _rewrite(node: Any, delta: LayoutDelta) -> Any:
    if isinstance(node, list):
        return _rewrite_list(node, delta)
    if not isinstance(node, BaseModel):
        return node
    node = _override(node, delta)
    updates: dict[str, Any] = {}
    for name in type(node).model_fields:
        value = getattr(node, name)
        if isinstance(value, BaseModel):
            rewritten = _rewrite(value, delta)
            if rewritten is not value:
                updates[name] = rewritten
        elif isinstance(value, list) and any(isinstance(v, BaseModel) for v in value):
            rewritten_list = _rewrite_list(value, delta)
            if rewritten_list is not value:
                updates[name] = rewritten_list
    return node.model_copy(update=updates) if updates else node


def _rewrite_list(children: list, delta: LayoutDelta) -> list:
    kept = []
    changed = False
    for child in children:
        if _field_id(child) in delta.hidden:
            changed = True
            continue
        rewritten = _rewrite(child, delta)
        changed |= rewritten is not child
        kept.append(rewritten)
    ordered = _reorder(kept, delta.order)
    if ordered is not None:
        return ordered
    return kept if changed else children


def _reorder(children: list, order: tuple[str, ...]) -> list | None:
    """The children with their FormFields rearranged in the slots fields occupy, or None when the
    order already matches."""
    if not order:
        return None
    slots = [i for i, c in enumerate(children) if _field_id(c) is not None]
    if len(slots) < 2:
        return None
    fields = [children[i] for i in slots]
    rearranged = []
    for fid in order:
        for f in fields:
            if _field_id(f) == fid and f not in rearranged:
                rearranged.append(f)
                break
    rearranged += [f for f in fields if f not in rearranged]
    if all(a is b for a, b in zip(rearranged, fields)):
        return None
    out = list(children)
    for slot, f in zip(slots, rearranged):
        out[slot] = f
    return out


def _override(node: BaseModel, delta: LayoutDelta) -> BaseModel:
    fid = _field_id(node)
    if fid is None or fid not in delta.overrides:
        return node
    o = delta.overrides[fid]
    update: dict[str, Any] = {}
    if o.label is not None:
        update["label"] = o.label
    if o.colspan is not None:
        update["colspan"] = o.colspan
    if not update:
        return node
    assert isinstance(node, ClientSideComponent)
    return node.model_copy(update={"metadata": node.metadata.model_copy(update=update)})


#: The delta of the page being rendered: ``(view class, delta)`` — set by the handler for the
#: request whose route's spec declares one, read by the mapper when it renders that class.
_active: ContextVar[tuple[type, LayoutDelta] | None] = ContextVar("mateu_layout_delta", default=None)


def activate(cls: type, delta: LayoutDelta | None):
    return _active.set((cls, delta) if delta is not None else None)


def deactivate(token) -> None:
    _active.reset(token)


def active_for(cls: type) -> LayoutDelta | None:
    current = _active.get()
    return current[1] if current is not None and current[0] is cls else None


__all__ = ["FieldOverride", "LayoutDelta", "activate", "active_for", "apply", "deactivate"]
