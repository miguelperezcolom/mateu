"""The ModelView bindable contract (__contract__) for the visual-builder tooling (Java's ModelViewContractExtractor)."""

from __future__ import annotations

from mateu_dtos import (
    ClientSideComponent,
    FormFieldMetadata,
    ServerSideComponent,
    UIIncrement,
)

from ._base import MixinBase
from ._common import (
    log,
    RunActionRq,
)


class ContractHandlerMixin(MixinBase):
    # ── ModelView contract ─────────────────────────────────────────────────────
    def _contract_response(self, cls, rq: RunActionRq) -> UIIncrement:
        instance = cls()
        self.bind_state(instance, rq.component_state)
        component = self.mapper.map_view(cls, instance, rq.consumed_route or "_empty")
        fields: list[dict] = []
        seen: set[str] = set()
        self._collect_fields(component, fields, seen)
        action_ids: list[str] = []
        for action in component.actions or []:
            aid = getattr(action, "id", None)
            if aid and aid not in action_ids:
                action_ids.append(aid)
        contract = {
            "modelView": component.server_side_type,
            "fields": fields,
            "actions": [{"id": aid} for aid in action_ids],
        }
        return UIIncrement(app_data={"_contract": contract})

    # A form field is the metadata of a ClientSideComponent — but components nest inside METADATA
    # records too (a Page/Form/Card holds its content there), so descend into metadata as well.
    def _collect_fields(self, component, fields: list[dict], seen: set[str]) -> None:
        if isinstance(component, ClientSideComponent):
            md = component.metadata
            if isinstance(md, FormFieldMetadata) and md.field_id and md.field_id not in seen:
                seen.add(md.field_id)
                fields.append({
                    "id": md.field_id,
                    "dataType": md.data_type,
                    "stereotype": md.stereotype,
                    "label": md.label,
                    "required": md.required,
                    "readOnly": md.read_only,
                })
            self._walk_metadata(md, fields, seen)
            for child in component.children:
                self._collect_fields(child, fields, seen)
        elif isinstance(component, ServerSideComponent):
            for child in component.children:
                self._collect_fields(child, fields, seen)

    def _walk_metadata(self, md, fields: list[dict], seen: set[str]) -> None:
        if md is None:
            return
        for name in getattr(type(md), "model_fields", {}):
            try:
                value = getattr(md, name)
            except Exception as e:  # noqa: BLE001 - logged, not fatal
                log.warning("_walk_metadata failed, falling back (%s)", e)
                continue
            if isinstance(value, (ClientSideComponent, ServerSideComponent)):
                self._collect_fields(value, fields, seen)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, (ClientSideComponent, ServerSideComponent)):
                        self._collect_fields(item, fields, seen)
