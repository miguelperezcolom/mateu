"""Editable views and master-detail views (Java's ``EditableView`` / ``AutoEditableView`` /
``MasterDetailView`` orchestrators): routing, the view ↔ editor toggle, the read-only gates and
the master-detail part picker. See :mod:`mateu_ui.uidl.editable_views`."""

from __future__ import annotations

from mateu_ui.dtos import (
    Action,
    Button,
    Message as MessageDto,
    PageMetadata,
    ServerSideComponent,
    UICommand,
    UIIncrement,
)
from mateu_ui.uidl import LookupLabelSupplier, UserFacingException
from mateu_ui.uidl.editable_views import (
    DetailPart,
    EditableView,
    MasterDetailView,
    NoSelection,
)

from .. import action_guard, islands
from ..action_guard import MateuForbiddenException
from ..mapper._common import _id
from ..hidden_members import hiding
from ..reflection import view_fields
from ..registry import normalize, type_name
from ..titles import record_title
from ..validation import VALIDATION_TITLE, client_validations, describe, form_violations
from ._base import MixinBase
from ._common import RunActionRq

#: The master-detail wire protocol (Java's MasterDetailView constants).
MD_PICK = "__md_pick:"
MD_ROUTE = "/__md/"
MD_STATE = "_mdPart"


class EditableViewHandlerMixin(MixinBase):
    # ── Resolution ─────────────────────────────────────────────────────────────
    def resolve_orchestrated_view(self, rq: RunActionRq):
        """The EditableView / MasterDetailView the request addresses — by serverSideType, or by
        route prefix so its ``/edit`` · ``/view`` · ``/__md/<key>`` sub-routes resolve — with its
        base route (``"/" + the @ui route``)."""

        def orchestrated(t) -> bool:
            return isinstance(t, type) and issubclass(t, (EditableView, MasterDetailView))

        if rq.server_side_type:
            by_name = self.registry.resolve(rq.server_side_type, None)
            if orchestrated(by_name):
                return by_name, "/" + normalize(getattr(by_name, "__mateu_ui__", ""))
        exact = self.registry.resolve(None, rq.route)
        if orchestrated(exact):
            return exact, "/" + normalize(getattr(exact, "__mateu_ui__", ""))
        pref = self.registry.resolve_by_prefix(rq.route)
        if pref is not None and orchestrated(pref[0]):
            return pref[0], "/" + pref[1]
        return None

    @staticmethod
    def _embedded(rq: RunActionRq) -> bool:
        state = rq.component_state or {}
        return islands.EMBEDDED_MARKER in islands.island_flags() or str(
            state.get(islands.EMBEDDED_MARKER)
        ).lower() == "true"

    def _orchestrator(self, cls, rq: RunActionRq):
        instance = cls()
        instance.http_request = rq
        self.bind_state(instance, rq.component_state or {})
        return instance

    # ── EditableView ───────────────────────────────────────────────────────────
    def handle_orchestrated_view(self, cls, base_route: str, rq: RunActionRq) -> UIIncrement:
        action_guard.ensure_class_access(self.mapper, cls)
        if issubclass(cls, MasterDetailView):
            return self._handle_master_detail(cls, base_route, rq)
        return self._handle_editable_view(cls, base_route, rq)

    def _handle_editable_view(self, cls, base_route: str, rq: RunActionRq) -> UIIncrement:
        view = self._orchestrator(cls, rq)
        aid = rq.action_id or ""
        sub = normalize(rq.route)[len(normalize(base_route)):].strip("/")

        def editable() -> None:
            # Java's checkEditable: a read-only view refuses the edit route and the edit/save
            # actions (403 + one WARN), not only undraws its Edit button
            if view.read_only():
                raise MateuForbiddenException(f"edit: {type_name(cls)} is read-only")
            # editable: a repeated Idempotency-Key may now be answered from memory
            from .. import idempotency_keys

            idempotency_keys.checkpoint()

        if aid == "":
            if sub == "edit" or sub.endswith("/edit"):
                editable()
                return self._editor_page(view, base_route, rq)
            return self._view_page(view, base_route, rq)
        if aid.startswith("search-"):
            # a Lookup() field of the editor searches through the editor (else the view class)
            target = view.editor() if not view.read_only() else view
            return self.field_search(target, rq)
        if aid == "edit":
            editable()
            return self._toggled(self._editor_page(view, base_route, rq), base_route + "/edit", rq, clean=False)
        if aid == "save":
            editable()
            editor = view.editor()
            # only what the editor lets the user write: a ReadOnly() / HiddenInEditor() /
            # server-owned field keeps the loaded value (the crud editor's rule)
            from ..mapper.crud_modes import without_hidden_inputs

            self.bind_state(editor, without_hidden_inputs(type(editor), rq.component_state or {}, False))
            # the editor advertises save as validationRequired: the server re-checks the same
            # constraints (Java's AutoEditableView.save → ServerConstraintCheck) instead of
            # trusting a client that may not have validated
            broken = form_violations(self.mapper, type(editor), editor)
            if broken:
                raise UserFacingException(describe(broken), title=VALIDATION_TITLE)
            view.save(editor)
            answer = self._toggled(self._view_page(view, base_route, rq), base_route + "/view", rq, clean=True)
            return answer.model_copy(update={"messages": [MessageDto(
                variant="success", position="middle", title="", text="Saved successfully", duration=3000,
            )]})
        if aid == "cancel-edit":
            return self._toggled(self._view_page(view, base_route, rq), base_route + "/view", rq, clean=True)
        # any other id: a declared action method of the orchestrator (guarded like any view action)
        return self.run_action(cls, view, rq)

    def _toggled(self, page: UIIncrement, route: str, rq: RunActionRq, clean: bool) -> UIIncrement:
        """The re-rendered page plus Java's ``EditableView.navigate`` commands: ``MarkAsClean`` when
        landing on the view (the edit form is gone — nothing else would clear the dirty guard) and
        ``PushStateToHistory`` unless embedded (in an island the toggle stays in place)."""
        target = self.target(rq)
        extra = []
        if clean:
            extra.append(UICommand(target_component_id=target, type="MarkAsClean", data=None))
        if not self._embedded(rq):
            extra.append(UICommand(target_component_id=target, type="PushStateToHistory", data=route))
        return page.model_copy(update={"commands": [*page.commands, *extra]})

    def _view_page(self, view: EditableView, base_route: str, rq: RunActionRq) -> UIIncrement:
        model = view.view()
        read_only = view.read_only()
        toolbar = [] if read_only else [Button(label="Edit", action_id="edit")]
        actions = (
            [Action(id="cancel-edit")]
            if read_only
            else [Action(id="edit"), Action(id="save", validation_required=True), Action(id="cancel-edit")]
        )
        return self._page(view, model, base_route, rq, toolbar, actions, read_only=True)

    def _editor_page(self, view: EditableView, base_route: str, rq: RunActionRq) -> UIIncrement:
        model = view.editor()
        toolbar = [
            Button(label="Cancel", action_id="cancel-edit", button_style="tertiary"),
            Button(label="Save", action_id="save", button_style="primary"),
        ]
        actions = [
            *self.mapper.field_actions(type(model)),
            Action(id="edit"),
            Action(id="save", validation_required=True),
            Action(id="cancel-edit"),
        ]
        return self._page(view, model, base_route, rq, toolbar, actions, read_only=False, editing=True)

    def _page(
        self, view, model, base_route: str, rq: RunActionRq, toolbar, actions,
        read_only: bool, editing: bool = False,
    ) -> UIIncrement:
        model_type = type(model)
        inline = islands.is_inline_request()
        title = self.mapper.T(record_title(model_type, model))
        page = self.mapper.client(
            PageMetadata(
                title=title,
                toolbar=toolbar,
                # an inline island nests under the host's section: h3, no badges/kpis (Java)
                level=1 if inline else 0,
            ),
            None,
            self.mapper.form_cards(model_type, model, read_only=read_only),
        )
        component = ServerSideComponent(
            id=_id(),
            server_side_type=type_name(type(view)),
            route=base_route + ("/edit" if editing else ""),
            children=[page],
            style="width: 100%;",
            initial_data=self._orchestrator_state(view, rq) | self.mapper.form_initial_data(model_type, model),
            actions=actions,
            triggers=[],
            rules=self.mapper.map_rules(model_type, model),
            page_width=getattr(type(view), "__mateu_page_width__", None),
            page_type="form" if editing else "detail",
            confirm_on_navigation_if_dirty=editing,
            # the entity's constraints travel on the view page too, as Java's EditableView sends
            # them (conformance case editable-view): the page itself is the read-only rendering
            validations=client_validations(self.mapper, model_type, model),
        )
        host = model if isinstance(model, LookupLabelSupplier) else view
        return self.fragment_response(title, component, rq, self.lookup_labels(model_type, model, host))

    def _orchestrator_state(self, orchestrator, rq: RunActionRq) -> dict:
        """What the page's state must carry for the NEXT request to rebuild the orchestrator: its
        own simple fields (the context an island host seeded — a stay id…) and the island
        markers."""
        state = {k: v for k, v in islands.seed_state(orchestrator).items() if k != "httpRequest"}
        incoming = rq.component_state or {}
        for marker in (islands.EMBEDDED_MARKER, islands.INLINE_MARKER):
            if marker in islands.island_flags() or str(incoming.get(marker)).lower() == "true":
                state[marker] = True
        return state

    # ── MasterDetailView ───────────────────────────────────────────────────────
    @staticmethod
    def detail_parts(cls) -> list[tuple[str, str, str, int]]:
        """``(field name, key, label, order)`` for every :class:`DetailPart` field, by order."""
        parts = []
        for f in view_fields(cls):
            marker = f.marker(DetailPart)
            if marker is None:
                continue
            key = marker.key or f.name
            parts.append((f.name, key, marker.label or f.name, marker.order))
        parts.sort(key=lambda p: p[3])
        return parts

    def _selected_part(self, cls, instance, rq: RunActionRq, parts) -> str | None:
        aid = rq.action_id or ""
        if aid.startswith(MD_PICK):
            return aid[len(MD_PICK):]
        route = rq.route or ""
        if MD_ROUTE.strip("/") + "/" in route:
            key = route.split(MD_ROUTE.strip("/") + "/", 1)[1].split("?", 1)[0].split("/", 1)[0]
            if key:
                return key
        picked = (rq.component_state or {}).get(MD_STATE)
        if isinstance(picked, str) and picked:
            return picked
        if instance.no_selection() == NoSelection.FIRST and parts:
            return parts[0][1]
        return None

    def _handle_master_detail(self, cls, base_route: str, rq: RunActionRq) -> UIIncrement:
        instance = self._orchestrator(cls, rq)
        aid = rq.action_id or ""
        parts = self.detail_parts(cls)
        keys = {p[1] for p in parts}
        if aid.startswith(MD_PICK) and aid[len(MD_PICK):] not in keys:
            action_guard.no_such_action(cls, aid)
        if aid and not aid.startswith(MD_PICK):
            return self.run_action(cls, instance, rq)
        instance.load()
        selected = self._selected_part(cls, instance, rq, parts)
        hidden = {name for name, key, _, _ in parts if key != selected}
        title = instance.title() or self.mapper.T(record_title(cls, instance))
        # the parts not selected are hidden members of the render (Java's VisibilitySupplier)
        with hiding(hidden):
            rendered = self.mapper.map_view(cls, instance, "_empty")
        page = rendered.children[0] if rendered.children else None
        bar = [
            Button(
                label=label,
                action_id=MD_PICK + key,
                button_style="primary" if key == selected else "tertiary",
            )
            for _, key, label, _ in parts
        ]
        content = [self.mapper.map_component(c) for c in instance.header()]
        content += list(page.children or []) if page is not None else []
        meta = page.metadata if page is not None and isinstance(page.metadata, PageMetadata) else PageMetadata()
        new_page = page.model_copy(update={
            "metadata": meta.model_copy(update={"title": title, "toolbar": [*meta.toolbar, *bar]}),
            "children": content,
        }) if page is not None else None
        actions = [*(rendered.actions or []), *(Action(id=MD_PICK + key) for _, key, _, _ in parts)]
        state = dict(rendered.initial_data or {})
        if selected:
            state[MD_STATE] = selected
        component = rendered.model_copy(update={
            "children": [new_page] if new_page is not None else rendered.children,
            "actions": actions,
            "initial_data": state | self._orchestrator_state(instance, rq),
        })
        return self.fragment_response(title, component, rq, self.lookup_labels(cls, instance, instance))


__all__ = ["EditableViewHandlerMixin", "MD_PICK", "MD_ROUTE", "MD_STATE"]
