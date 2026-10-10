"""The app's FIELD TYPE catalogue — its domain vocabulary (``OrderStatus``, ``Money``, ``Email``):
what a concept looks like as a field or a column, declared once (the Python port of Java's
``FieldTypeEntry`` / ``FieldTypeCatalogSupplier``).

Two producers, one table, exactly like the REST source catalogue: :class:`FieldTypeCatalogSupplier`
subclasses (code, the *derived* half) and ``specs/ui/types.yaml`` (the *authored* half), merged by
id with **authored winning**. A YAML ``FormField`` / ``GridColumn`` names a type by ``fieldType:``;
a field in code names one with ``Annotated[str, FieldType("OrderStatus")]``. The type supplies
DEFAULTS — what the field declares itself wins.
"""

from __future__ import annotations

from dataclasses import dataclass, field, fields
from typing import Any

#: snake_case attribute → the authored (camelCase) key, in FieldTypeEntry's component order.
ATTRIBUTE_KEYS: dict[str, str] = {
    "label": "label",
    "data_type": "dataType",
    "stereotype": "stereotype",
    "placeholder": "placeholder",
    "description": "description",
    "required": "required",
    "read_only": "readOnly",
    "options": "options",
    "options_source": "optionsSource",
    "min": "min",
    "max": "max",
    "step": "step",
    "colspan": "colspan",
    "style": "style",
    "css_classes": "cssClasses",
    "align": "align",
    "width": "width",
    "auto_width": "autoWidth",
    "tones": "tones",
}


@dataclass(frozen=True)
class FieldTypeEntry:
    """One field type. Every attribute is optional; an absent (None/empty) one supplies nothing.
    ``tones`` maps a value to a badge tone (success|warning|danger|info|neutral)."""

    id: str
    label: str | None = None
    data_type: str | None = None
    stereotype: str | None = None
    placeholder: str | None = None
    description: str | None = None
    required: bool | None = None
    read_only: bool | None = None
    options: list[Any] | None = None
    options_source: Any | None = None
    min: float | None = None
    max: float | None = None
    step: float | None = None
    colspan: int | None = None
    style: str | None = None
    css_classes: str | None = None
    align: str | None = None
    width: str | None = None
    auto_width: bool | None = None
    tones: dict[str, str] | None = field(default=None)

    def attributes(self) -> dict[str, Any]:
        """The attributes this type supplies, as AUTHORED keys (camelCase); empty ones omitted
        (Java serialises the record NON_EMPTY)."""
        out: dict[str, Any] = {}
        for f in fields(self):
            if f.name == "id":
                continue
            value = getattr(self, f.name)
            if value is None or value == "" or value == [] or value == {}:
                continue
            out[ATTRIBUTE_KEYS[f.name]] = value
        return out

    @staticmethod
    def of_node(node: Any) -> "FieldTypeEntry | None":
        """An authored entry (camelCase keys, snake_case accepted too); unknown keys are dropped,
        like Java's FAIL_ON_UNKNOWN_PROPERTIES=false. None when it has no id."""
        if not isinstance(node, dict):
            return None
        type_id = str(node.get("id") or "").strip()
        if not type_id:
            return None
        kwargs: dict[str, Any] = {}
        for attr, key in ATTRIBUTE_KEYS.items():
            if key in node:
                kwargs[attr] = node[key]
            elif attr in node:
                kwargs[attr] = node[attr]
        if isinstance(kwargs.get("tones"), dict):
            kwargs["tones"] = {str(k): str(v) for k, v in kwargs["tones"].items()}
        return FieldTypeEntry(id=type_id, **kwargs)


class FieldTypeCatalogSupplier:
    """Implemented by a class of the app (instantiated with no arguments) that contributes field
    types in code — the derived half of the catalogue; ``specs/ui/types.yaml`` wins over it."""

    def field_types(self) -> list[FieldTypeEntry]:
        raise NotImplementedError


@dataclass(frozen=True)
class FieldType:
    """``Annotated`` marker: the field (or listing column) takes the named type's attributes as
    defaults — the code twin of the authored ``fieldType:`` key."""

    id: str


__all__ = ["ATTRIBUTE_KEYS", "FieldType", "FieldTypeCatalogSupplier", "FieldTypeEntry"]
